import {
    Connection,
    PublicKey,
    SystemProgram,
} from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import * as crypto from 'crypto';

const MERKLE_TREE_DEPTH = 20;

export class PrivacyShield {
    private program: Program;

    constructor(connection: Connection, _programId: string, idl: any, wallet: any) {
        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: 'confirmed',
        });
        try {
            this.program = new Program(idl, provider);
        } catch (e) {
            // Silently fail if IDL is invalid - allowed for mock mode/offline audits
            this.program = { programId: new PublicKey(_programId) } as any;
        }
    }

    public getProgramId(): PublicKey {
        return this.program.programId;
    }

    public generateCommitment() {
        const secret = crypto.randomBytes(32);
        const nullifier = crypto.randomBytes(32);

        // H = Hash(secret || nullifier)
        const commitment = crypto.createHash('sha256')
            .update(Buffer.concat([secret, nullifier]))
            .digest();

        const nullifierHash = crypto.createHash('sha256')
            .update(nullifier)
            .digest();

        return {
            secret,
            nullifier,
            commitment,
            nullifierHash,
            commitmentHex: commitment.toString('hex'),
        };
    }

    public async deposit(commitment: Buffer) {
        const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from('vault')], this.program.programId);
        const [statePda] = PublicKey.findProgramAddressSync([Buffer.from('state')], this.program.programId);

        return await this.program.methods
            .deposit(Array.from(commitment))
            .accounts({
                state: statePda,
                depositor: this.program.provider.publicKey,
                vault: vaultPda,
                systemProgram: SystemProgram.programId,
            } as any)
            .rpc();
    }

    /**
     * Build the authentication path for a commitment at a given index.
     */
    public async getMerkleProof(commitmentIndex: number, allCommitments: Buffer[]): Promise<{ proof: Buffer[], indices: number[] }> {
        if (commitmentIndex >= allCommitments.length) {
            throw new Error("Commitment index out of range");
        }

        // Cache empty branch hashes up to tree depth
        const zeros: Buffer[] = [];
        let currentZero = Buffer.alloc(32, 0);
        for (let i = 0; i < MERKLE_TREE_DEPTH; i++) {
            zeros.push(currentZero);
            currentZero = crypto.createHash('sha256')
                .update(Buffer.concat([currentZero, currentZero]))
                .digest();
        }

        const proof: Buffer[] = [];
        const indices: number[] = [];
        let index = commitmentIndex;

        let nodes = [...allCommitments];

        for (let level = 0; level < MERKLE_TREE_DEPTH; level++) {
            if (index % 2 === 0) {
                const sibling = (index + 1 < nodes.length) ? nodes[index + 1] : zeros[level];
                proof.push(sibling);
                indices.push(0);
            } else {
                proof.push(nodes[index - 1]);
                indices.push(1);
            }

            const nextLevelNodes: Buffer[] = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const left = nodes[i];
                const right = (i + 1 < nodes.length) ? nodes[i + 1] : zeros[level];
                // Deterministic parent hashing
                const parent = crypto.createHash('sha256')
                    .update(left < right ? Buffer.concat([left, right]) : Buffer.concat([right, left]))
                    .digest();
                nextLevelNodes.push(parent);
            }
            nodes = nextLevelNodes;
            index = Math.floor(index / 2);
        }

        return { proof, indices };
    }

    /**
     * Groth16 proof generation via snarkjs.
     */
    public async generateZKProof(
        secret: Buffer,
        nullifier: Buffer,
        root: Buffer,
        merklePath: { proof: Buffer[], indices: number[] },
        wasmPath: string,
        zkeyPath: string
    ) {
        const { proof, publicSignals } = await (require('snarkjs')).groth16.fullProve(
            {
                root: root.toString('hex'),
                nullifierHash: crypto.createHash('sha256').update(nullifier).digest().toString('hex'),
                secret: secret.toString('hex'),
                nullifier: nullifier.toString('hex'),
                pathElements: merklePath.proof.map(p => p.toString('hex')),
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

    private formatProof(proof: any): Buffer {
        // Flatten pi_a, pi_b, pi_c for the on-chain verifier
        return Buffer.concat([
            Buffer.from(proof.pi_a[0]), Buffer.from(proof.pi_a[1]),
            Buffer.from(proof.pi_b[0][0]), Buffer.from(proof.pi_b[0][1]),
            Buffer.from(proof.pi_b[1][0]), Buffer.from(proof.pi_b[1][1]),
            Buffer.from(proof.pi_c[0]), Buffer.from(proof.pi_c[1])
        ]);
    }

    public async withdraw(
        nullifierHash: Buffer,
        root: Buffer,
        proof: Buffer[],
        recipient: PublicKey,
        relayer: any,
        fee: number = 0
    ) {
        const [statePda] = PublicKey.findProgramAddressSync([Buffer.from('state')], this.program.programId);

        return await this.program.methods
            .withdraw(
                Array.from(nullifierHash),
                Array.from(root),
                proof.map(p => Array.from(p)),
                new (this.program.provider as any).anchor.BN(fee)
            )
            .accounts({
                state: statePda,
                recipient,
                relayer: relayer.publicKey,
                systemProgram: SystemProgram.programId,
            } as any)
            .signers([relayer])
            .rpc();
    }
}
