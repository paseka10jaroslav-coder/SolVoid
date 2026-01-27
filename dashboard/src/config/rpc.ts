/**
 * SOL-ZERO RPC Configuration Pool
 * Consolidated list of public endpoints for protocol telemetry and operations.
 */

export const RPC_POOL = {
    MAINNET: [
        "https://rpc.ankr.com/solana",
        "https://solana.drpc.org",
        "https://solana.api.onfinality.io/public",
        "https://api.mainnet-beta.solana.com",
        "https://solana.api.pocket.network/",
        "https://public.rpc.solanavibestation.com/"
    ],
    DEVNET: [
        "https://rpc.ankr.com/solana_devnet",
        "https://api.devnet.solana.com"
    ],
    TESTNET: [
        "https://api.testnet.solana.com"
    ]
};

export const DEFAULT_RPC = {
    MAINNET: RPC_POOL.MAINNET[5], // solanavibestation - public endpoint
    DEVNET: RPC_POOL.DEVNET[1],   // Official Solana devnet  
    TESTNET: RPC_POOL.TESTNET[0]
};
