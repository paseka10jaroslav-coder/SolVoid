import { Connection, PublicKey } from '@solana/web3.js';
import { PrivacyShield } from './privacy/shield';
import { PrivacyPipeline } from './pipeline';
import { PassportManager } from './passport/manager';
import { EventBus } from './events/bus';
import * as crypto from 'crypto';

export interface SolVoidConfig {
    rpcUrl: string;
    programId: string;
    relayerUrl?: string;
}

/**
 * SolVoidClient (Browser-safe version)
 * High-level orchestration for scanning, shielding, and ZK-withdrawals.
 * Note: Server-side dependencies (express relayer, shadow RPC) are excluded for browser compatibility.
 */
export class SolVoidClient {
    private pipeline: PrivacyPipeline;
    private passport: PassportManager;
    private connection: Connection;
    private protocolShield: PrivacyShield;

    constructor(config: SolVoidConfig, wallet: any) {
        this.connection = new Connection(config.rpcUrl, 'confirmed');
        this.passport = new PassportManager();

        const idl: any = {
            version: "0.1.0",
            name: "solvoid",
            instructions: [
                { name: "initialize", accounts: [{ name: "state", isMut: true, isSigner: false }, { name: "admin", isMut: true, isSigner: true }, { name: "systemProgram", isMut: false, isSigner: false }], args: [{ name: "amount", type: "u64" }] },
                { name: "deposit", accounts: [{ name: "state", isMut: true, isSigner: false }, { name: "depositor", isMut: true, isSigner: true }, { name: "vault", isMut: true, isSigner: false }, { name: "systemProgram", isMut: false, isSigner: false }], args: [{ name: "commitment", type: { array: ["u8", 32] } }] },
                { name: "withdraw", accounts: [{ name: "state", isMut: true, isSigner: false }, { name: "vault", isMut: true, isSigner: false }, { name: "recipient", isMut: true, isSigner: false }, { name: "nullifierRecord", isMut: true, isSigner: false }, { name: "relayer", isMut: true, isSigner: true }, { name: "systemProgram", isMut: false, isSigner: false }], args: [{ name: "nullifierHash", type: { array: ["u8", 32] } }, { name: "root", type: { array: ["u8", 32] } }, { name: "proof", type: "bytes" }, { name: "fee", type: "u64" }] }
            ],
            address: config.programId
        };

        this.protocolShield = new PrivacyShield(this.connection, config.programId, idl, wallet);
        this.pipeline = new PrivacyPipeline(this.connection, this.protocolShield);
    }

    /**
     * Scans an address for privacy leaks and prepares remediation shielding.
     */
    public async protect(address: PublicKey) {
        const results = await this.pipeline.processAddress(address);

        // Update passport score automatically
        if (results.length > 0) {
            const avgScore = results.reduce((acc, r) => acc + r.privacyScore, 0) / results.length;
            this.passport.updateScore(address.toBase58(), avgScore);
        }

        return results;
    }

    /**
     * Retrieve local scoring history and earned badges for a wallet.
     */
    public async getPassport(address: string) {
        return this.passport.getPassport(address);
    }

    /**
     * Automatic scan and atomic shield for all tainted assets.
     * Note: In browser context, this performs analysis only (no relay broadcast)
     */
    public async rescue(address: PublicKey) {
        EventBus.info('Initiating rescue analysis...', { address: address.toBase58() });

        // 1. Scan for leaks
        const results = await this.protect(address);
        const allLeaks = results.flatMap((r: any) => r.leaks);

        if (allLeaks.length === 0) {
            EventBus.info('No leaked assets found. Wallet is secure.');
            return { status: 'secure', message: 'No leaked assets found.' };
        }

        EventBus.info(`Found ${allLeaks.length} privacy leaks requiring remediation.`);

        // Calculate improvement potential
        const avgScore = results.length > 0
            ? Math.round(results.reduce((acc, r) => acc + r.privacyScore, 0) / results.length)
            : 100;

        return {
            status: 'analysis_complete',
            leakCount: allLeaks.length,
            currentScore: avgScore,
            potentialScore: Math.min(95, avgScore + 40),
            message: 'Rescue analysis complete. Use relayer service for transaction broadcast.'
        };
    }

    /**
     * Directly shields an amount of SOL.
     */
    public async shield(_amount: number) {
        EventBus.info('Generating commitment for shielding operation...');
        const commitmentData = this.protocolShield.generateCommitment();

        EventBus.emit('COMMITMENT_CREATED', 'Commitment generated', {
            commitment: commitmentData.commitmentHex
        });

        // In browser context, return commitment data for user to broadcast
        return {
            status: 'commitment_ready',
            commitmentData,
            message: 'Commitment generated. Sign and broadcast via connected wallet.'
        };
    }

    /**
     * End-to-end withdrawal preparation
     * Returns proof data for user/relayer to submit
     */
    public async prepareWithdrawal(
        secretHex: string,
        nullifierHex: string,
        recipient: PublicKey,
        allCommitments: Buffer[],
        wasmPath: string,
        zkeyPath: string
    ) {
        EventBus.info('Preparing withdrawal proof...');

        const secret = Buffer.from(secretHex, 'hex');
        const nullifier = Buffer.from(nullifierHex, 'hex');

        // Generate proof of membership in the commitment pool
        const commitment = crypto.createHash('sha256').update(Buffer.concat([secret, nullifier])).digest();
        const index = allCommitments.findIndex(c => c.equals(commitment));
        if (index === -1) {
            EventBus.error('Commitment not found in state');
            throw new Error("Commitment not found in state");
        }

        EventBus.info('Generating Merkle proof...');
        const merklePath = await this.protocolShield.getMerkleProof(index, allCommitments);

        // Final root used for ZK verification
        const root = Buffer.alloc(32);

        EventBus.info('Generating ZK-SNARK proof (Groth16)...');
        const { proof } = await this.protocolShield.generateZKProof(
            secret,
            nullifier,
            root,
            merklePath,
            wasmPath,
            zkeyPath
        );

        EventBus.proofGenerated('Groth16');

        const nullifierHash = crypto.createHash('sha256').update(nullifier).digest();

        return {
            status: 'proof_ready',
            proof,
            nullifierHash: nullifierHash.toString('hex'),
            root: root.toString('hex'),
            recipient: recipient.toBase58(),
            message: 'Proof generated. Submit via relayer or directly to chain.'
        };
    }
}
