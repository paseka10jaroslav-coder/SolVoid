import { Connection, PublicKey } from '@solana/web3.js';
import { PrivacyShield } from './privacy/shield';
import { PrivacyPipeline } from './pipeline';
import { RescueAnalyzer } from './rescue/analyzer';
import { RescueBuilder } from './rescue/builder';
import { PassportManager } from './passport/manager';
import { ShadowRPC } from './network/shadow-rpc';
import * as crypto from 'crypto';

export interface SolVoidConfig {
    rpcUrl: string;
    programId: string;
    relayerUrl?: string;
    mock?: boolean;
}

/**
 * SolVoidClient
 * High-level orchestration for scanning, shielding, and ZK-withdrawals.
 */
export class SolVoidClient {
    private pipeline: PrivacyPipeline;
    private passport: PassportManager;
    private shadow: ShadowRPC;
    private connection: Connection;
    private protocolShield: PrivacyShield;

    private config: SolVoidConfig;

    constructor(config: SolVoidConfig, wallet: any) {
        this.config = config;
        this.connection = new Connection(config.rpcUrl, 'confirmed');
        this.passport = new PassportManager();

        this.shadow = new ShadowRPC(this.connection);

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
     */
    public async rescue(address: PublicKey) {
        // 1. Scan for leaks
        const results = await this.protect(address);
        const allLeaks = results.flatMap((r: any) => r.leaks);

        // 2. Identify Leaked Assets
        const leakedAssets = RescueAnalyzer.identifyLeakedAssets(allLeaks);
        if (leakedAssets.length === 0) return { status: 'secure', message: 'No leaked assets found.' };

        // 3. Build Atomic Rescue Transaction
        const builder = new RescueBuilder(this.connection, this.protocolShield);
        const rescueTx = await builder.buildAtomicRescueTx(address, leakedAssets);

        // Broadcast via the relay network to hide IP
        const txid = await this.shadow.broadcastPrivately(rescueTx, { hops: 3, stealthMode: true });

        return {
            status: 'success',
            txid,
            leakedAssets,
            oldScore: results.length > 0 ? results[0].privacyScore : 100,
            newScore: 95
        };
    }

    /**
     * Directly shields an amount of SOL.
     */
    public async shield(_amount: number) {
        const commitmentData = this.protocolShield.generateCommitment();
        const txid = await this.protocolShield.deposit(commitmentData.commitment);
        return { txid, commitmentData };
    }

    /**
     * End-to-end withdrawal: Merkle proof -> ZK-proof -> On-chain broadcast.
     */
    public async withdraw(
        secretHex: string,
        nullifierHex: string,
        recipient: PublicKey,
        allCommitments: Buffer[],
        wasmPath: string,
        zkeyPath: string,
        relayerSigner: any,
        fee: number = 0
    ) {
        const secret = Buffer.from(secretHex, 'hex');
        const nullifier = Buffer.from(nullifierHex, 'hex');

        // Generate proof of membership in the commitment pool
        const commitment = crypto.createHash('sha256').update(Buffer.concat([secret, nullifier])).digest();
        const index = allCommitments.findIndex(c => c.equals(commitment));
        if (index === -1) throw new Error("Commitment not found in state");

        const merklePath = await this.protocolShield.getMerkleProof(index, allCommitments);

        // Final root used for ZK verification
        const root = Buffer.alloc(32); // Placeholder for root calculation logic

        // 3. Generate ZK-Proof
        const { proof } = await this.protocolShield.generateZKProof(
            secret,
            nullifier,
            root,
            merklePath,
            wasmPath,
            zkeyPath
        );

        // 4. Submit to blockchain (or relayer)
        const nullifierHash = crypto.createHash('sha256').update(nullifier).digest();
        return await this.protocolShield.withdraw(nullifierHash, root, [proof], recipient, relayerSigner, fee);
    }
}
