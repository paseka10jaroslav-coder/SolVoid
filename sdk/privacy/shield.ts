import {
    Connection,
    PublicKey,
    SystemProgram,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor/dist/esm';
import * as crypto from 'crypto';
import { PoseidonHasher, PoseidonUtils } from '../crypto/poseidon';
import { WalletAdapter } from '../client';
import { z } from 'zod';
import {
    IdlSchema,
    enforce,
    DataOrigin,
    DataTrust,
    CommitmentDataSchema,
    MerkleProofSchema
} from '../integrity';

const MERKLE_TREE_DEPTH = 20;

/**
 * Validated Commitment Data
 */
export type CommitmentData = z.infer<typeof CommitmentDataSchema>;

/**
 * Validated Merkle Proof
 */
export type MerkleProof = z.infer<typeof MerkleProofSchema>;

export class PrivacyShield {
    private readonly program: Program<any>;
    private programId?: PublicKey;

    constructor(connection: Connection, idlIn: unknown, wallet: WalletAdapter, programId?: string) {
        // Boundary Enforcement: IDL (Rule 10)
        const idl = enforce(IdlSchema, idlIn, {
            origin: DataOrigin.INTERNAL_LOGIC,
            trust: DataTrust.TRUSTED,
            createdAt: Date.now(),
            owner: 'PrivacyShield'
        }).value as any;

        // Ensure IDL has proper address metadata
        if (programId && !idl.address) {
            idl.address = programId;
        }

        // Ensure global Buffer is available for both browser and server
        if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
            globalThis.Buffer = Buffer;
        }
        if (typeof window !== 'undefined' && !(window as any).Buffer) {
            (window as any).Buffer = Buffer;
        }
        if (typeof global !== 'undefined' && !global.Buffer) {
            global.Buffer = Buffer;
        }

        const provider = new AnchorProvider(connection, wallet as any, {
            preflightCommitment: 'confirmed',
        });

        // Create program synchronously but with Buffer polyfill ensured
        this.program = new Program(idl, provider);
        
        if (programId) {
            this.programId = new PublicKey(programId);
        }
    }

    public getProgramId(): PublicKey {
        return this.programId || this.program.programId;
    }

    /**
     * Compute Poseidon hash using circomlibjs
     * Matches Rust implementation parameters
     */
    private async poseidonHash(left: Buffer, right: Buffer): Promise<Buffer> {
        return await PoseidonHasher.hashTwoInputs(left, right);
    }

    /**
     * Generate commitment using Poseidon hash
     * Uses H(secret, nullifier) to match circuit implementation
     */
    public async generateCommitment(): Promise<CommitmentData> {
        // Use cryptographically secure random values
        const secret = crypto.randomBytes(32);
        const nullifier = crypto.randomBytes(32);

        // Use Poseidon hash to match circuit implementation
        const commitment = await this.poseidonHash(secret, nullifier);
        const nullifierHash = await this.poseidonHash(nullifier, Buffer.alloc(32, 0));

        const dataUnvalidated = {
            secret: secret.toString('hex'),
            nullifier: nullifier.toString('hex'),
            commitment: commitment.toString('hex'),
            nullifierHash: nullifierHash.toString('hex'),
            commitmentHex: commitment.toString('hex'),
        };

        return enforce(CommitmentDataSchema, dataUnvalidated, {
            origin: DataOrigin.INTERNAL_LOGIC,
            trust: DataTrust.TRUSTED,
            createdAt: Date.now(),
            owner: 'PrivacyShield'
        }).value;
    }

    public async deposit(commitmentHex: string): Promise<string> {
        if (!/^[0-9a-fA-F]{64}$/.test(commitmentHex)) throw new Error("Invalid commitment format");
        const commitment = Buffer.from(commitmentHex, 'hex');

        const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from('vault')], this.getProgramId());
        const [statePda] = PublicKey.findProgramAddressSync([Buffer.from('state')], this.getProgramId());

        return await (this.program.methods as any)
            .deposit(Array.from(commitment))
            .accounts({
                state: statePda,
                depositor: this.program.provider.publicKey,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    }

    /**
     * Generate Merkle proof using Poseidon hash
     * Matches Rust implementation for tree consistency
     */
    public async getMerkleProof(commitmentIndex: number, allCommitmentsHex: readonly string[]): Promise<MerkleProof> {
        if (commitmentIndex < 0 || commitmentIndex >= allCommitmentsHex.length) {
            throw new Error(`Commitment index ${commitmentIndex} out of range [0, ${allCommitmentsHex.length})`);
        }

        const allCommitments = allCommitmentsHex.map(c => PoseidonUtils.hexToBuffer(c));

        // Generate zero hashes using Poseidon
        const zeros: Buffer[] = [];
        let currentZero = PoseidonUtils.zeroBuffer();
        for (let i = 0; i < MERKLE_TREE_DEPTH; i++) {
            // Explicitly create new Buffer to avoid SharedArrayBuffer type issues
            const zeroCopy = Buffer.alloc(32);
            currentZero.copy(zeroCopy);
            zeros.push(zeroCopy);
            currentZero = await this.poseidonHash(currentZero, currentZero);
        }

        const proof: Buffer[] = [];
        const indices: number[] = [];
        let index = commitmentIndex;

        let nodes = [...allCommitments];

        for (let level = 0; level < MERKLE_TREE_DEPTH; level++) {
            if (index % 2 === 0) {
                const sibling = (index + 1 < nodes.length) ? (nodes[index + 1] ?? zeros[level]!) : zeros[level]!;
                // Explicitly create new Buffer to avoid type issues
                const siblingCopy = Buffer.alloc(32);
                sibling.copy(siblingCopy);
                proof.push(siblingCopy);
                indices.push(0);
            } else {
                const leftSibling = nodes[index - 1] ?? zeros[level]!;
                // Explicitly create new Buffer to avoid type issues
                const leftCopy = Buffer.alloc(32);
                leftSibling.copy(leftCopy);
                proof.push(leftCopy);
                indices.push(1);
            }

            const nextLevelNodes: Buffer[] = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const left = nodes[i]!;
                const right = (i + 1 < nodes.length) ? (nodes[i + 1] ?? zeros[level]!) : zeros[level]!;

                const parent = await this.poseidonHash(left, right);
                nextLevelNodes.push(parent);
            }
            nodes = nextLevelNodes as any[];
            index = Math.floor(index / 2);
        }

        const proofData = {
            proof: proof.map(p => PoseidonUtils.bufferToHex(p)),
            indices
        };

        return enforce(MerkleProofSchema, proofData, {
            origin: DataOrigin.INTERNAL_LOGIC,
            trust: DataTrust.TRUSTED,
            createdAt: Date.now(),
            owner: 'PrivacyShield'
        }).value;
    }

    /**
     * Generate ZK-SNARK proof using Poseidon nullifier hash
     * Ensures circuit inputs match TypeScript computations
     */
    public async generateZKProof(
        secretHex: string,
        nullifierHex: string,
        rootHex: string,
        merklePath: MerkleProof,
        wasmPath: string,
        zkeyPath: string
    ): Promise<{ proof: Buffer, publicSignals: any }> {
        const snarkjs = require('snarkjs');

        // Use Poseidon for nullifier hash to match circuit
        const nullifierBuffer = PoseidonUtils.hexToBuffer(nullifierHex);
        const nullifierHash = await this.poseidonHash(nullifierBuffer, Buffer.alloc(32, 0));

        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            {
                root: rootHex,
                nullifierHash: PoseidonUtils.bufferToHex(nullifierHash),
                secret: secretHex,
                nullifier: nullifierHex,
                pathElements: merklePath.proof,
                pathIndices: merklePath.indices
            },
            wasmPath,
            zkeyPath
        );

        return {
            proof: this.formatProof(proof),
            publicSignals
        };
    }

    private formatProof(proof: { pi_a: any[], pi_b: any[][], pi_c: any[] }): Buffer {
        return Buffer.concat([
            Buffer.from(proof.pi_a[0]), Buffer.from(proof.pi_a[1]),
            Buffer.from(proof.pi_b[0][0]), Buffer.from(proof.pi_b[0][1]),
            Buffer.from(proof.pi_b[1][0]), Buffer.from(proof.pi_b[1][1]),
            Buffer.from(proof.pi_c[0]), Buffer.from(proof.pi_c[1])
        ]);
    }

    public async withdraw(
        nullifierHashHex: string,
        rootHex: string,
        proofHexArray: string[],
        recipient: PublicKey,
        relayer: { publicKey: PublicKey, signTransaction: any },
        feeLamports: number = 0
    ): Promise<string> {
        if (!Number.isInteger(feeLamports) || feeLamports < 0) {
            throw new Error(`Invalid fee: ${feeLamports}. Must be non-negative integer (Lamports)`);
        }

        const [statePda] = PublicKey.findProgramAddressSync([Buffer.from('state')], this.getProgramId());

        return await (this.program.methods as any)
            .withdraw(
                Array.from(Buffer.from(nullifierHashHex, 'hex')),
                Array.from(Buffer.from(rootHex, 'hex')),
                proofHexArray.map(p => Array.from(Buffer.from(p, 'hex'))),
                new BN(feeLamports)
            )
            .accounts({
                state: statePda,
                recipient,
                relayer: relayer.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([relayer as any])
            .rpc();
    }
}
