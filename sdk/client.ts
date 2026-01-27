import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { PrivacyShield } from './privacy/shield';
import { PrivacyPipeline } from './pipeline';
import { PassportManager } from './passport/manager';
import { EventBus } from './events/bus';
import { PoseidonHasher, PoseidonUtils } from './crypto/poseidon';
import {
    DataOrigin,
    DataTrust,
    Unit,
    IdlSchema,
    enforce,
    PublicKeySchema
} from './integrity';
import { ScanResult } from './pipeline';

export interface SolVoidConfig {
    readonly rpcUrl: string;
    readonly programId: string;
    readonly relayerUrl?: string;
}

export interface WalletAdapter {
    readonly publicKey: PublicKey | null;
    readonly signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
    readonly signAllTransactions: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
}

/**
 * SolVoidClient (Browser-safe version)
 */
export class SolVoidClient {
    private readonly pipeline: PrivacyPipeline;
    private readonly passport: PassportManager;
    private readonly connection: Connection;
    private readonly protocolShield: PrivacyShield;

    constructor(config: SolVoidConfig, wallet: WalletAdapter) {
        this.connection = new Connection(config.rpcUrl, 'confirmed');
        this.passport = new PassportManager();

        // Optimized Anchor 0.30 IDL
        const idlUnvalidated = {
            version: "0.1.0",
            name: "solvoid",
            instructions: [
                {
                    name: "initialize",
                    accounts: [
                        { name: "state", writable: true, signer: false },
                        { name: "admin", writable: true, signer: true },
                        { name: "systemProgram", writable: false, signer: false }
                    ],
                    args: [{ name: "amount", type: "u64" }]
                },
                {
                    name: "deposit",
                    accounts: [
                        { name: "state", writable: true, signer: false },
                        { name: "depositor", writable: true, signer: true },
                        { name: "vault", writable: true, signer: false },
                        { name: "systemProgram", writable: false, signer: false }
                    ],
                    args: [{ name: "commitment", type: { array: ["u8", 32] } }]
                },
                {
                    name: "withdraw",
                    accounts: [
                        { name: "state", writable: true, signer: false },
                        { name: "vault", writable: true, signer: false },
                        { name: "recipient", writable: true, signer: false },
                        { name: "nullifierRecord", writable: true, signer: false },
                        { name: "relayer", writable: true, signer: true },
                        { name: "systemProgram", writable: false, signer: false }
                    ],
                    args: [
                        { name: "nullifierHash", type: { array: ["u8", 32] } },
                        { name: "root", type: { array: ["u8", 32] } },
                        { name: "proof", type: "bytes" },
                        { name: "fee", type: "u64" }
                    ]
                }
            ],
            accounts: [],
            types: [],
            events: [],
            errors: [],
            metadata: {
                address: config.programId
            }
        };

        const enforcedIdl = enforce(IdlSchema, idlUnvalidated, {
            origin: DataOrigin.INTERNAL_LOGIC,
            trust: DataTrust.TRUSTED,
            createdAt: Date.now(),
            owner: 'System'
        });

        // Ensure we pass the program ID as a string clearly
        this.protocolShield = new PrivacyShield(this.connection, enforcedIdl.value, wallet, config.programId);
        this.pipeline = new PrivacyPipeline(this.connection, this.protocolShield);
    }

    public async protect(address: PublicKey): Promise<ScanResult[]> {
        enforce(PublicKeySchema, address.toBase58(), {
            origin: DataOrigin.INTERNAL_LOGIC,
            trust: DataTrust.TRUSTED,
            createdAt: Date.now(),
            owner: 'Client'
        });

        const results = await this.pipeline.processAddress(address);

        if (results.length > 0) {
            const avgScore = results.reduce((acc, r) => acc + r.privacyScore, 0) / results.length;
            this.passport.updateScore(address.toBase58(), Math.round(avgScore));
        }

        return results;
    }

    public async getPassport(address: string) {
        enforce(PublicKeySchema, address, {
            origin: DataOrigin.UI_INPUT,
            trust: DataTrust.UNTRUSTED,
            createdAt: Date.now(),
            owner: 'User'
        });
        return this.passport.getPassport(address);
    }

    public async rescue(address: PublicKey) {
        EventBus.info('Initiating rescue analysis...', { address: address.toBase58() });

        const results = await this.protect(address);
        const allLeaks = results.flatMap((r) => r.leaks);

        if (allLeaks.length === 0) {
            EventBus.info('No leaked assets found. Wallet is secure.');
            return { status: 'secure', message: 'No leaked assets found.' };
        }

        EventBus.info(`Found ${allLeaks.length} privacy leaks requiring remediation.`);

        const avgScore = results.length > 0
            ? Math.round(results.reduce((acc, r) => acc + r.privacyScore, 0) / results.length)
            : 100;

        return {
            status: 'analysis_complete' as const,
            leakCount: allLeaks.length,
            currentScore: avgScore,
            potentialScore: Math.min(95, avgScore + 40),
            message: 'Rescue analysis complete. Use relayer service for transaction broadcast.'
        };
    }

    public async shield(amountLamports: number) {
        if (!Number.isInteger(amountLamports) || amountLamports <= 0) {
            throw new Error(`Invalid amount: ${amountLamports}. Must be positive integer (Lamports).`);
        }

        EventBus.info('Generating commitment for shielding operation...');
        const commitmentData = await this.protocolShield.generateCommitment();

        EventBus.emit('COMMITMENT_CREATED', 'Commitment generated', {
            commitment: commitmentData.commitmentHex
        });

        return {
            status: 'commitment_ready' as const,
            commitmentData,
            message: 'Commitment generated. Sign and broadcast via connected wallet.',
            units: Unit.LAMPORT
        };
    }

    public async prepareWithdrawal(
        secretHex: string,
        nullifierHex: string,
        recipient: PublicKey,
        allCommitmentsHex: string[],
        wasmPath: string,
        zkeyPath: string
    ) {
        EventBus.info('Preparing withdrawal proof...');

        if (!/^[0-9a-fA-F]{64}$/.test(secretHex)) throw new Error("Invalid secret format");
        if (!/^[0-9a-fA-F]{64}$/.test(nullifierHex)) throw new Error("Invalid nullifier format");

        const secret = Buffer.from(secretHex, 'hex');
        const nullifier = Buffer.from(nullifierHex, 'hex');
        
        // Use Poseidon hash to match shield.ts implementation
        const commitment = await PoseidonHasher.hashTwoInputs(secret, nullifier);
        const commitmentHex = PoseidonUtils.bufferToHex(commitment);

        const index = allCommitmentsHex.indexOf(commitmentHex);
        if (index === -1) {
            EventBus.error('Commitment not found in state');
            throw new Error("Commitment not found in state");
        }

        EventBus.info('Generating Merkle proof...');
        const merklePath = await this.protocolShield.getMerkleProof(index, allCommitmentsHex);

        // Calculate actual Merkle root from proof path using Poseidon
        const calculateMerkleRoot = async (commitmentIndex: number, allCommitments: string[], merklePath: any): Promise<string> => {
            let currentHash = PoseidonUtils.hexToBuffer(allCommitments[commitmentIndex]);
            
            for (let i = 0; i < merklePath.proof.length; i++) {
                const sibling = PoseidonUtils.hexToBuffer(merklePath.proof[i]);
                if (merklePath.indices[i] === 0) {
                    // Create new Buffer to avoid SharedArrayBuffer type issues
                    const leftCopy = Buffer.alloc(32);
                    const rightCopy = Buffer.alloc(32);
                    currentHash.copy(leftCopy);
                    sibling.copy(rightCopy);
                    currentHash = await PoseidonHasher.hashTwoInputs(leftCopy, rightCopy);
                } else {
                    // Create new Buffer to avoid SharedArrayBuffer type issues
                    const leftCopy = Buffer.alloc(32);
                    const rightCopy = Buffer.alloc(32);
                    sibling.copy(leftCopy);
                    currentHash.copy(rightCopy);
                    currentHash = await PoseidonHasher.hashTwoInputs(leftCopy, rightCopy);
                }
            }
            
            return PoseidonUtils.bufferToHex(currentHash);
        };
        
        const rootHex = await calculateMerkleRoot(index, allCommitmentsHex, merklePath);

        EventBus.info('Generating ZK-SNARK proof (Groth16)...');
        const { proof } = await this.protocolShield.generateZKProof(
            secretHex,
            nullifierHex,
            rootHex,
            merklePath,
            wasmPath,
            zkeyPath
        );

        EventBus.proofGenerated('Groth16');

        // Use Poseidon hash to match shield.ts nullifierHash generation
        const nullifierHash = await PoseidonHasher.hashWithZero(nullifier);

        return {
            status: 'proof_ready' as const,
            proof,
            nullifierHash: PoseidonUtils.bufferToHex(nullifierHash),
            root: rootHex,
            recipient: recipient.toBase58(),
            message: 'Proof generated. Submit via relayer or directly to chain.'
        };
    }
}
