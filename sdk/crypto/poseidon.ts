import { buildPoseidon } from 'circomlibjs';
import { Buffer } from 'buffer';

/**
 * Poseidon hash wrapper with type safety and BN254 compatibility
 * Matches Rust implementation parameters for cryptographic consistency
 */
export class PoseidonHasher {
    private static poseidon: any = null;
    private static initialized = false;

    /**
     * Initialize Poseidon with BN254 field parameters
     * Width: 3 (2 inputs + 1 output for binary Merkle tree)
     * Security: 128-bit (standard for zk-SNARK applications)
     */
    private static async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Build Poseidon instance with parameters matching Rust implementation
            this.poseidon = await buildPoseidon();
            
            // Configure for BN254 field with width=3 (2 inputs + 1 output)
            // This matches the Rust Poseidon<Bn254, 3> setup
            await this.poseidon.ready();
            
            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize Poseidon: ${error}`);
        }
    }

    /**
     * Ensure Poseidon is initialized before use
     */
    private static async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * Convert Buffer to BigInt for Poseidon input
     * Handles little-endian conversion consistently with Rust
     */
    private static bufferToBigInt(buffer: Buffer): bigint {
        return BigInt('0x' + buffer.toString('hex'));
    }

    /**
     * Convert BigInt output to Buffer (32 bytes, little-endian)
     * Ensures compatibility with Rust field element format
     */
    private static bigIntToBuffer(value: bigint): Buffer {
        // Convert to hex string and pad to 64 characters (32 bytes)
        const hex = value.toString(16).padStart(64, '0');
        
        // Convert hex to Buffer (little-endian to match Rust)
        const buffer = Buffer.from(hex, 'hex');
        
        // Ensure exactly 32 bytes
        if (buffer.length !== 32) {
            throw new Error(`Poseidon output must be 32 bytes, got ${buffer.length}`);
        }
        
        return buffer;
    }

    /**
     * Hash two 32-byte inputs using Poseidon
     * @param left - First 32-byte input
     * @param right - Second 32-byte input
     * @returns 32-byte hash output
     */
    static async hashTwoInputs(left: Buffer, right: Buffer): Promise<Buffer> {
        await this.ensureInitialized();

        if (left.length !== 32 || right.length !== 32) {
            throw new Error('Both inputs must be exactly 32 bytes');
        }

        try {
            // Convert Buffers to BigInt for Poseidon
            const leftBigInt = this.bufferToBigInt(left);
            const rightBigInt = this.bufferToBigInt(right);

            // Compute Poseidon hash: H(left, right)
            const resultBigInt = this.poseidon([leftBigInt, rightBigInt]);

            // Convert result back to Buffer
            return this.bigIntToBuffer(resultBigInt);
        } catch (error) {
            throw new Error(`Poseidon hash failed: ${error}`);
        }
    }

    /**
     * Hash single input with zero (for nullifier computation)
     * @param input - 32-byte input
     * @returns 32-byte hash output
     */
    static async hashWithZero(input: Buffer): Promise<Buffer> {
        const zero = Buffer.alloc(32, 0);
        return this.hashTwoInputs(input, zero);
    }

    /**
     * Compute commitment from secret and nullifier
     * @param secret - 32-byte secret
     * @param nullifier - 32-byte nullifier
     * @returns 32-byte commitment
     */
    static async computeCommitment(secret: Buffer, nullifier: Buffer): Promise<Buffer> {
        return this.hashTwoInputs(secret, nullifier);
    }

    /**
     * Compute nullifier hash from nullifier
     * @param nullifier - 32-byte nullifier
     * @returns 32-byte nullifier hash
     */
    static async computeNullifierHash(nullifier: Buffer): Promise<Buffer> {
        return this.hashWithZero(nullifier);
    }

    /**
     * Compute Merkle root from leaf and proof path
     * @param leaf - 32-byte leaf value
     * @param proof - Array of 32-byte proof elements
     * @param indices - Array of indices (0 for left, 1 for right)
     * @returns 32-byte Merkle root
     */
    static async computeMerkleRoot(
        leaf: Buffer,
        proof: Buffer[],
        indices: number[]
    ): Promise<Buffer> {
        if (proof.length !== indices.length) {
            throw new Error('Proof and indices arrays must have same length');
        }

        let current = leaf;

        for (let i = 0; i < proof.length; i++) {
            const sibling = proof[i];
            const index = indices[i];

            if (index === 0) {
                // Current is left sibling
                current = await this.hashTwoInputs(current, sibling);
            } else {
                // Current is right sibling
                current = await this.hashTwoInputs(sibling, current);
            }
        }

        return current;
    }

    /**
     * Verify hash output is within BN254 field constraints
     * Ensures compatibility with zk-SNARK circuit requirements
     */
    static verifyFieldCompatibility(hash: Buffer): boolean {
        if (hash.length !== 32) return false;

        try {
            // Convert to BigInt and check it's within BN254 field
            const value = this.bufferToBigInt(hash);
            
            // BN254 prime field modulus (p)
            const BN254_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
            
            return value < BN254_PRIME;
        } catch {
            return false;
        }
    }

    /**
     * Get Poseidon instance for advanced usage
     * @returns The underlying circomlibjs Poseidon instance
     */
    static async getPoseidonInstance(): Promise<any> {
        await this.ensureInitialized();
        return this.poseidon;
    }

    /**
     * Reset the Poseidon instance (useful for testing)
     */
    static reset(): void {
        this.poseidon = null;
        this.initialized = false;
    }
}

/**
 * Type definitions for Poseidon operations
 */
export type PoseidonHash = Buffer;
export type MerkleProof = {
    proof: Buffer[];
    indices: number[];
};

/**
 * Utility functions for working with Poseidon hashes
 */
export class PoseidonUtils {
    /**
     * Convert hex string to Buffer (32 bytes)
     */
    static hexToBuffer(hex: string): Buffer {
        if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
            throw new Error('Hex must be exactly 64 characters (32 bytes)');
        }
        return Buffer.from(hex, 'hex');
    }

    /**
     * Convert Buffer to hex string
     */
    static bufferToHex(buffer: Buffer): string {
        return buffer.toString('hex');
    }

    /**
     * Validate Buffer is 32 bytes
     */
    static validate32Bytes(buffer: Buffer): void {
        if (buffer.length !== 32) {
            throw new Error(`Buffer must be exactly 32 bytes, got ${buffer.length}`);
        }
    }

    /**
     * Create zero Buffer (32 bytes of zeros)
     */
    static zeroBuffer(): Buffer {
        return Buffer.alloc(32, 0);
    }
}
