import { Connection, PublicKey } from '@solana/web3.js';
import { PrivacyEngine } from './privacy-engine';
import { PrivacyShield } from './privacy/shield';

export class PrivacyPipeline {
    private connection: Connection;
    private engine: PrivacyEngine;
    private shield: PrivacyShield;

    constructor(connection: Connection, shield: PrivacyShield) {
        this.connection = connection;
        this.engine = new PrivacyEngine();
        this.shield = shield;
    }

    /**
     * Map web3.js signatures to privacy results by analyzing the last 10 txs.
     */
    public async processAddress(address: PublicKey) {
        const signatures = await this.connection.getSignaturesForAddress(address);
        const results = [];

        for (const sig of signatures.slice(0, 10)) {
            const tx: any = await this.connection.getTransaction(sig.signature, {
                maxSupportedTransactionVersion: 0,
            });

            if (tx) {
                // Parse standard Solana tx structure into ours
                const txData: any = {
                    message: {
                        accountKeys: tx.transaction.message.staticAccountKeys.map((k: any) => k.toBase58()),
                        header: tx.transaction.message.header,
                        instructions: tx.transaction.message.compiledInstructions.map((ix: any) => ({
                            programIdIndex: ix.programIdIndex,
                            accounts: ix.accountKeyIndexes,
                            data: Buffer.from(ix.data).toString('base64')
                        }))
                    },
                    meta: {
                        innerInstructions: tx.meta?.innerInstructions || [],
                        logMessages: tx.meta?.logMessages || []
                    },
                    signatures: [sig.signature]
                };

                const leaks = this.engine.analyzeTransaction(txData);
                const privacyScore = this.engine.calculateScore(leaks);

                if (leaks.length > 0) {
                    const remediation = await this.generateRemediation(address, leaks);
                    results.push({
                        signature: sig.signature,
                        leaks,
                        remediation,
                        privacyScore
                    });
                } else {
                    results.push({
                        signature: sig.signature,
                        leaks: [],
                        privacyScore: 100
                    });
                }
            }
        }

        return results;
    }

    /**
     * Suggest specific fixes like shielding if we hit critical leak thresholds.
     */
    private async generateRemediation(_user: PublicKey, leaks: any[]) {
        const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH');

        if (criticalLeaks.length > 0) {
            const commitmentData = this.shield.generateCommitment();

            return {
                action: 'SHIELD_BALANCE',
                data: {
                    commitment: commitmentData.commitmentHex,
                    nullifierHash: commitmentData.nullifierHash.toString('hex'),
                },
                description: `High risk leaks found. Shielding recommended to break clear identity links.`,
            };
        }

        return null;
    }
}
