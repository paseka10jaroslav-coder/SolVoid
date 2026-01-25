#!/usr/bin/env node

/**
 * SolVoid CLI
 * Utility for shielding assets and auditing privacy leaks on Solana.
 */

import { PublicKey, Keypair } from '@solana/web3.js';
import { SolVoidClient } from '../sdk/client';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || args.includes('--help')) {
        console.log(`
SolVoid: The Digital Fortress for Solana

Commands:
  protect <address>    Scan address for leaks and view Privacy Passport
  rescue <address>     Atomic shielding of all leaked assets
  shield <amount>      Execute a private deposit (Surgical Shielding)
  withdraw <secret> <nullifier> <recipient>   Unlinkable ZK withdrawal
  
Flags:
  --rpc <url>         Solana RPC URL
  --relayer <url>     Relayer/Shadow RPC URL
  --surgical          Optimize shielding for leaked assets only
  --shadow-rpc        Broadcast via encrypted relay hops
  --mock              Enable simulated/mock mode for testing
`);
        process.exit(0);
    }

    const rpcUrl = args.includes('--rpc') ? args[args.indexOf('--rpc') + 1] : 'https://api.mainnet-beta.solana.com';
    const programId = args.includes('--program') ? args[args.indexOf('--program') + 1] : 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i';
    const relayerUrl = args.includes('--relayer') ? args[args.indexOf('--relayer') + 1] : 'http://localhost:3000';
    const mock = args.includes('--mock');

    const wallet = Keypair.generate();
    const client = new SolVoidClient({ rpcUrl, programId, relayerUrl, mock }, wallet);

    try {
        switch (command) {
            case 'protect': {
                const address = new PublicKey(args[1]);
                console.log(`\nScanning ${address.toBase58()}...`);

                const passport = await client.getPassport(address.toBase58());
                const results = await client.protect(address);

                console.log(`\n--- PRIVACY PASSPORT ---`);
                const scoreColor = passport.overallScore < 50 ? '\x1b[31m' : passport.overallScore < 80 ? '\x1b[33m' : '\x1b[32m';
                console.log(`Overall Score: ${scoreColor}${passport.overallScore}/100\x1b[0m`);
                console.log(`Badges: ${passport.badges.map(b => b.icon + ' ' + b.name).join(', ') || 'None'}`);

                results.forEach((res: any) => {
                    console.log(`\n---------------------------------------------------------`);
                    console.log(`Signature: ${res.signature}`);
                    if (res.leaks.length > 0) {
                        res.leaks.forEach((leak: any) => {
                            const sevColor = leak.severity === 'CRITICAL' ? '\x1b[31m' : '\x1b[33m';
                            console.log(`  - [${sevColor}${leak.severity}\x1b[0m] ${leak.description}`);
                        });
                    }
                });
                break;
            }

            case 'rescue': {
                const address = new PublicKey(args[1]);
                console.log(`\nExecuting rescue for: ${address.toBase58()}`);
                const result = await client.rescue(address);

                if (result.status === 'success') {
                    console.log(`\nRescue successful.`);
                    console.log(`Leaked assets shielded and mixed via relay.`);
                    console.log(`TX Signature: ${result.txid}`);
                    console.log(`Score improved: ${result.oldScore} -> ${result.newScore}`);
                } else {
                    console.log(`\n${result.message}`);
                }
                break;
            }

            case 'shield': {
                const amount = parseFloat(args[1]) * 1e9;
                console.log(`Shielding ${args[1]} SOL...`);
                const { txid, commitmentData } = await client.shield(amount);
                console.log('TX Signature:', txid);
                console.log('--- SAVE THESE SECRETS ---');
                console.log('Secret:', commitmentData.secret.toString('hex'));
                console.log('Nullifier:', commitmentData.nullifier.toString('hex'));
                break;
            }

            case 'withdraw': {
                const secret = args[1];
                const nullifier = args[2];
                const recipient = new PublicKey(args[3]);
                let commitmentBuffers: Buffer[] = [];

                if (!mock) {
                    console.log(`Fetching commitments from: ${relayerUrl}...`);
                    const response = await fetch(`${relayerUrl}/commitments`);
                    const { commitments } = (await response.json()) as any;
                    commitmentBuffers = commitments.map((c: string) => Buffer.from(c, 'hex'));
                } else {
                    console.log(`[MOCK] Skipping commitment fetch...`);
                }

                console.log(`Generating ZK proof and submitting withdrawal...`);
                const result = await client.withdraw(
                    secret,
                    nullifier,
                    recipient,
                    commitmentBuffers,
                    './withdraw.wasm',
                    './withdraw.zkey',
                    wallet
                );
                console.log('Result:', result);
                break;
            }

            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (e: any) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

/**
 * Basic input validation for signatures vs file paths.
 */
export function validateInput(input: string): { type: 'file' | 'signature'; path?: string } {
    if (!input || input.trim().length === 0) {
        throw new Error('Input cannot be empty');
    }

    if (input.endsWith('.json')) {
        if (require('fs').existsSync(input)) {
            return { type: 'file', path: input };
        }
        throw new Error('File not found');
    }

    // Base58 check for Solana signatures
    if (/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(input)) {
        return { type: 'signature' };
    }

    throw new Error('Invalid format');
}

if (require.main === module) {
    main();
}
