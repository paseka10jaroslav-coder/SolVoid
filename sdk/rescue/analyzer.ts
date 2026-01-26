import { Leak } from '../types';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { EventBus } from '../events/bus';

export interface LeakedAsset {
    mint: string;
    mintName?: string;
    amount: number;
    decimals: number;
    reason: string;
    severity: string;
    isNative: boolean;
    ataAddress?: string;
}

export interface RescueAnalysis {
    leakedAssets: LeakedAsset[];
    totalValueLamports: number;
    splTokenCount: number;
    nativeSOL: number;
    riskScore: number;
    estimatedFee: number;
}

const NATIVE_SOL_MINT = '11111111111111111111111111111111';

export class RescueAnalyzer {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Comprehensive multi-asset rescue analysis
     * Identifies all compromised assets: SPL tokens + native SOL
     */
    public async analyzeWallet(walletAddress: PublicKey, leaks: Leak[]): Promise<RescueAnalysis> {
        EventBus.info('Analyzing wallet for multi-asset rescue...');

        const leakedAssets: LeakedAsset[] = [];
        const seenMints = new Set<string>();
        let totalValueLamports = 0;
        let splTokenCount = 0;
        let nativeSOL = 0;

        // Get all token accounts for the wallet
        const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
            walletAddress,
            { programId: TOKEN_PROGRAM_ID }
        );

        EventBus.info(`Found ${tokenAccounts.value.length} token accounts`);

        // Analyze leaks to find affected mints
        for (const leak of leaks) {
            let mint = NATIVE_SOL_MINT;

            // Extract mint from scope (e.g., "ata_link:MintAddress")
            if (leak.scope.includes(':')) {
                const parts = leak.scope.split(':');
                if (parts[1] && parts[1].length >= 32) {
                    mint = parts[1];
                }
            }

            // Check for token-specific leaks
            if (leak.type === 'token' && leak.scope.includes('mint:')) {
                mint = leak.scope.split('mint:')[1]?.slice(0, 44) || NATIVE_SOL_MINT;
            }

            if (!seenMints.has(mint)) {
                seenMints.add(mint);

                if (mint === NATIVE_SOL_MINT) {
                    // Native SOL
                    const balance = await this.connection.getBalance(walletAddress);
                    nativeSOL = balance;
                    totalValueLamports += balance;

                    leakedAssets.push({
                        mint,
                        mintName: 'SOL',
                        amount: balance,
                        decimals: 9,
                        reason: leak.description,
                        severity: leak.severity,
                        isNative: true
                    });

                    EventBus.leakDetected('Native SOL', leak.severity, `${balance / 1e9} SOL exposed`);
                } else {
                    // SPL Token
                    const tokenAccount = tokenAccounts.value.find(
                        ta => ta.account.data.parsed.info.mint === mint
                    );

                    if (tokenAccount) {
                        const info = tokenAccount.account.data.parsed.info;
                        const amount = parseInt(info.tokenAmount.amount);
                        const decimals = info.tokenAmount.decimals;
                        splTokenCount++;

                        leakedAssets.push({
                            mint,
                            amount,
                            decimals,
                            reason: leak.description,
                            severity: leak.severity,
                            isNative: false,
                            ataAddress: tokenAccount.pubkey.toBase58()
                        });

                        EventBus.leakDetected('SPL Token', leak.severity,
                            `${amount / Math.pow(10, decimals)} tokens (${mint.slice(0, 8)}...)`);
                    }
                }
            }
        }

        // If no specific leaks, but wallet has assets, flag as potentially exposed
        if (leakedAssets.length === 0 && leaks.length > 0) {
            const balance = await this.connection.getBalance(walletAddress);
            if (balance > 0) {
                nativeSOL = balance;
                totalValueLamports += balance;
                leakedAssets.push({
                    mint: NATIVE_SOL_MINT,
                    mintName: 'SOL',
                    amount: balance,
                    decimals: 9,
                    reason: 'General privacy leak affecting wallet',
                    severity: leaks[0]?.severity || 'MEDIUM',
                    isNative: true
                });
            }
        }

        // Calculate risk score
        const riskScore = this.calculateRiskScore(leaks, leakedAssets);

        // Estimate rescue transaction fee
        const estimatedFee = this.estimateRescueFee(leakedAssets);

        EventBus.info(`Rescue analysis complete: ${leakedAssets.length} assets, risk score ${riskScore}`);

        return {
            leakedAssets,
            totalValueLamports,
            splTokenCount,
            nativeSOL,
            riskScore,
            estimatedFee
        };
    }

    /**
     * Static method for backwards compatibility
     */
    public static identifyLeakedAssets(leaks: Leak[]): LeakedAsset[] {
        const leakedAssets: LeakedAsset[] = [];
        const seenMints = new Set<string>();

        for (const leak of leaks) {
            let mint = NATIVE_SOL_MINT;

            if (leak.scope.includes(':')) {
                const parts = leak.scope.split(':');
                if (parts[1] && parts[1].length >= 32) {
                    mint = parts[1];
                }
            }

            if (!seenMints.has(mint)) {
                leakedAssets.push({
                    mint,
                    amount: 0,
                    decimals: 9,
                    reason: leak.description,
                    severity: leak.severity,
                    isNative: mint === NATIVE_SOL_MINT
                });
                seenMints.add(mint);
            }
        }

        return leakedAssets;
    }

    /**
     * Calculate aggregate risk score based on leak severity
     */
    private calculateRiskScore(leaks: Leak[], assets: LeakedAsset[]): number {
        const severityWeights: Record<string, number> = {
            'CRITICAL': 40,
            'HIGH': 25,
            'MEDIUM': 15,
            'LOW': 5
        };

        let score = 0;
        for (const leak of leaks) {
            score += severityWeights[leak.severity] || 10;
        }

        // Cap at 100
        return Math.min(100, score);
    }

    /**
     * Estimate total rescue transaction fee
     */
    private estimateRescueFee(assets: LeakedAsset[]): number {
        // Base fee: 5000 lamports
        let fee = 5000;

        // Add per-asset fee (each token transfer = ~5000 lamports)
        fee += assets.length * 5000;

        // ZK proof verification fee (estimate)
        fee += 50000;

        return fee;
    }
}
