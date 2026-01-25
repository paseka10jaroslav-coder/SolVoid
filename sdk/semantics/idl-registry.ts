import { logger } from '../utils/logger';
import { OnChainIdlFetcher } from '../registry/idl-fetcher';

// Mock IDL suitable for System Program transfers
const SYSTEM_IDL = {
    version: "0.1.0",
    name: "system_program",
    instructions: [
        {
            name: "transfer",
            accounts: [
                { name: "from", isMut: true, isSigner: true },
                { name: "to", isMut: true, isSigner: false }
            ],
            args: [
                { name: "lamports", type: "u64" }
            ],
            discriminator: [2, 0, 0, 0]
        }
    ]
};

// Mock IDL for SPL Token
const SPL_TOKEN_IDL = {
    version: "0.1.0",
    name: "spl_token",
    instructions: [
        {
            name: "transfer",
            accounts: [
                { name: "source", isMut: true, isSigner: false },
                { name: "destination", isMut: true, isSigner: false },
                { name: "authority", isMut: false, isSigner: true }
            ],
            args: [
                { name: "amount", type: "u64" }
            ],
            discriminator: [3]
        }
    ]
};

// Mock IDL for a generic DeFi swap
const DEFI_SWAP_IDL = {
    version: "1.0.0",
    name: "super_swap",
    instructions: [
        {
            name: "swap",
            accounts: [
                { name: "user_authority", isMut: false, isSigner: true },
                { name: "user_source", isMut: true, isSigner: false },
                { name: "pool_source", isMut: true, isSigner: false },
                { name: "pool_dest", isMut: true, isSigner: false },
                { name: "user_dest", isMut: true, isSigner: false }
            ],
            args: [
                { name: "amount_in", type: "u64" },
                { name: "min_out", type: "u64" }
            ],
            discriminator: [100, 100, 100, 100, 100, 100, 100, 100]
        }
    ]
};

export class IdlRegistry {
    private cache: Map<string, any>;

    constructor() {
        this.cache = new Map();
        this.cache.set("11111111111111111111111111111111", SYSTEM_IDL);
        this.cache.set("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", SPL_TOKEN_IDL);
        this.cache.set("DeFi111111111111111111111111111111111111111", DEFI_SWAP_IDL);
    }

    public async fetchIdl(programId: string): Promise<any | null> {
        if (this.cache.has(programId)) {
            return this.cache.get(programId);
        }

        try {
            const fetcher = new OnChainIdlFetcher("https://api.mainnet-beta.solana.com");
            const idl = await fetcher.fetchIdl(programId);
            if (idl) {
                this.cache.set(programId, idl);
                return idl;
            }
        } catch (e) {
            // Fallback to null
        }

        logger.debug(`[IdlRegistry] IDL not found on-chain for ${programId}`);
        return null;
    }

    public registerIdl(programId: string, idl: any): void {
        this.cache.set(programId, idl);
    }
}
