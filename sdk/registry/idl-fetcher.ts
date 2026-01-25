import { Connection, PublicKey } from '@solana/web3.js';
import { Idl } from '../semantics/types';
import * as zlib from 'zlib';

export class OnChainIdlFetcher {
    private connection: Connection;

    constructor(rpcUrl: string) {
        this.connection = new Connection(rpcUrl);
    }

    /**
     * Real production logic to fetch Anchor IDL from on-chain account.
     * 1. Derive PDA from [buffer("anchor:idl"), programId]
     * 2. Fetch Account Data
     * 3. Strip 8-byte discriminator
     * 4. Read 4-byte length (little endian)
     * 5. Read compressed bytes
     * 6. Decompress (Inflate)
     * 7. JSON Parse
     */
    public async fetchIdl(programIdString: string): Promise<Idl | null> {
        try {
            const programId = new PublicKey(programIdString);

            // 1. Derive Address
            const [idlAddress] = PublicKey.findProgramAddressSync(
                [Buffer.from("anchor:idl"), programId.toBuffer()],
                programId
            );

            // 2. Fetch Account Info
            const accountInfo = await this.connection.getAccountInfo(idlAddress);
            if (!accountInfo) return null; // No IDL stored on chain

            // 3. Parse Data
            // Anchor IDL Account Layout:
            // Discriminator (8 bytes)
            // Authority (32 bytes)
            // Data Len (4 bytes u32)
            // Compressed Data (zlib)

            const data = accountInfo.data;
            // Skip 8 discriminator + 32 authority = 40 bytes
            const headerSize = 8 + 32;
            if (data.length < headerSize + 4) return null;

            const compressedLen = data.readUInt32LE(headerSize);
            const compressedBytes = data.subarray(headerSize + 4, headerSize + 4 + compressedLen);

            // 4. Decompress
            return new Promise((resolve) => {
                zlib.inflate(compressedBytes, (err, buffer) => {
                    if (err) {
                        console.warn("IDL Decompression failed:", err);
                        resolve(null);
                    } else {
                        try {
                            const jsonString = buffer.toString('utf-8');
                            const idl = JSON.parse(jsonString);
                            resolve(idl as Idl);
                        } catch (parseErr) {
                            console.warn("IDL JSON Parse failed");
                            resolve(null);
                        }
                    }
                });
            });

        } catch (e) {
            console.warn(`Failed to fetch on-chain IDL for ${programIdString}`, e);
            return null;
        }
    }
}
