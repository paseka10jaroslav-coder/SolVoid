import { Leak } from '../types';

export interface LeakedAsset {
    mint: string;
    amount?: number;
    reason: string;
    severity: string;
}

export class RescueAnalyzer {
    /**
     * Parse scan results to find every compromised token mint.
     * Looks for 'ata_link:Mint' or defaults to SOL.
     */
    public static identifyLeakedAssets(leaks: Leak[]): LeakedAsset[] {
        const leakedAssets: LeakedAsset[] = [];
        const seenMints = new Set<string>();

        for (const leak of leaks) {
            let mint = '11111111111111111111111111111111'; // Default SOL

            if (leak.scope.includes(':')) {
                const parts = leak.scope.split(':');
                if (parts[1] && parts[1].length >= 32) {
                    mint = parts[1];
                }
            }

            if (!seenMints.has(mint)) {
                leakedAssets.push({
                    mint,
                    reason: leak.description,
                    severity: leak.severity
                });
                seenMints.add(mint);
            }
        }

        return leakedAssets;
    }

    /**
     * Estimated savings compared to a full wallet shield.
     */
    public static calculateSavings(leakedAssets: LeakedAsset[], totalBalance: number): { amount: number, percentage: number } {
        // Dummy logic: assume each leaked asset averages 1.5 units
        const leakedSum = leakedAssets.length * 1.5;
        const savings = totalBalance - leakedSum;
        const percentage = (savings / totalBalance) * 100;

        return {
            amount: Math.max(0, savings),
            percentage: Math.min(100, Math.max(0, percentage))
        };
    }
}
