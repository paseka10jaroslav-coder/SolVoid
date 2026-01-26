import {
    TransactionMessage,
    TransactionInstruction,
    VersionedTransaction,
    PublicKey,
    Connection,
    SystemProgram,
    LAMPORTS_PER_SOL,
    ComputeBudgetProgram
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { PrivacyShield } from '../privacy/shield';
import { LeakedAsset } from './analyzer';
import { EventBus } from '../events/bus';

export interface RescueOptions {
    useJito?: boolean;
    jitoTipLamports?: number;
    useShadowRPC?: boolean;
    priorityFee?: number;
}

// Jito tip accounts (mainnet)
const JITO_TIP_ACCOUNTS = [
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    'HFqU5x63VTqvQss8hp11i4bVEWH5GBF7dSprRSQmAPP1',
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
    'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'
];

export class RescueBuilder {
    private shield: PrivacyShield;
    private connection: Connection;

    constructor(connection: Connection, shield: PrivacyShield) {
        this.connection = connection;
        this.shield = shield;
    }

    /**
     * Build atomic multi-asset rescue transaction
     * Handles both native SOL and SPL tokens in a single transaction
     */
    public async buildAtomicRescueTx(
        payer: PublicKey,
        leakedAssets: LeakedAsset[],
        options: RescueOptions = {}
    ): Promise<VersionedTransaction> {
        EventBus.info(`Building atomic rescue for ${leakedAssets.length} assets...`);

        const instructions: TransactionInstruction[] = [];
        const commitments: { mint: string; commitment: Buffer }[] = [];

        // Add priority fee if specified or using Jito
        if (options.priorityFee || options.useJito) {
            const fee = options.priorityFee || 100000; // 0.0001 SOL default
            instructions.push(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: fee
                })
            );
            EventBus.info(`Priority fee set: ${fee} microLamports`);
        }

        // Add Jito tip if enabled
        if (options.useJito) {
            const tipIx = await this.buildJitoTip(payer, options.jitoTipLamports);
            instructions.push(tipIx);
            EventBus.info(`Jito tip added: ${(options.jitoTipLamports || 10000) / LAMPORTS_PER_SOL} SOL`);
        }

        // Process each leaked asset
        for (const asset of leakedAssets) {
            EventBus.info(`Processing rescue for ${asset.isNative ? 'SOL' : asset.mint.slice(0, 8)}...`);

            // Generate unique commitment for this asset
            const commitmentData = this.shield.generateCommitment();
            commitments.push({
                mint: asset.mint,
                commitment: commitmentData.commitment
            });

            // Get program addresses
            const [vaultPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('vault')],
                this.shield.getProgramId()
            );
            const [statePDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('state')],
                this.shield.getProgramId()
            );

            if (asset.isNative) {
                // Native SOL deposit
                const depositIx = await this.buildSOLDepositInstruction(
                    payer,
                    vaultPDA,
                    statePDA,
                    commitmentData.commitment,
                    asset.amount
                );
                instructions.push(depositIx);
            } else {
                // SPL Token deposit
                const tokenIxs = await this.buildTokenDepositInstructions(
                    payer,
                    vaultPDA,
                    statePDA,
                    new PublicKey(asset.mint),
                    asset.ataAddress ? new PublicKey(asset.ataAddress) : undefined,
                    commitmentData.commitment,
                    asset.amount,
                    asset.decimals
                );
                instructions.push(...tokenIxs);
            }
        }

        // Build versioned transaction
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');

        const messageV0 = new TransactionMessage({
            payerKey: payer,
            recentBlockhash: blockhash,
            instructions,
        }).compileToV0Message();

        const tx = new VersionedTransaction(messageV0);

        EventBus.info(`Rescue transaction built: ${instructions.length} instructions`);
        EventBus.emit('COMMITMENT_CREATED', `Multi-asset rescue prepared`, {
            assetCount: leakedAssets.length,
            commitments: commitments.length,
            useJito: options.useJito
        });

        return tx;
    }

    /**
     * Build SOL deposit instruction for shielding
     */
    private async buildSOLDepositInstruction(
        payer: PublicKey,
        vaultPDA: PublicKey,
        statePDA: PublicKey,
        commitment: Buffer,
        amount: number
    ): Promise<TransactionInstruction> {
        // For a complete implementation, this would use the actual program instruction
        // Here we create the instruction structure
        return new TransactionInstruction({
            keys: [
                { pubkey: statePDA, isSigner: false, isWritable: true },
                { pubkey: payer, isSigner: true, isWritable: true },
                { pubkey: vaultPDA, isSigner: false, isWritable: true },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
            ],
            programId: this.shield.getProgramId(),
            data: Buffer.concat([
                Buffer.from([1]), // Deposit instruction discriminator
                commitment, // 32 bytes commitment
                Buffer.from(new BigUint64Array([BigInt(amount)]).buffer) // Amount as u64
            ])
        });
    }

    /**
     * Build SPL Token deposit instructions
     * Includes ATA creation if needed
     */
    private async buildTokenDepositInstructions(
        payer: PublicKey,
        vaultPDA: PublicKey,
        statePDA: PublicKey,
        mint: PublicKey,
        sourceATA: PublicKey | undefined,
        commitment: Buffer,
        amount: number,
        decimals: number
    ): Promise<TransactionInstruction[]> {
        const instructions: TransactionInstruction[] = [];

        // Get or create vault's ATA for this token
        const vaultATA = await getAssociatedTokenAddress(mint, vaultPDA, true);

        // Check if vault ATA exists
        const vaultATAInfo = await this.connection.getAccountInfo(vaultATA);
        if (!vaultATAInfo) {
            // Create vault ATA
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    payer,
                    vaultATA,
                    vaultPDA,
                    mint
                )
            );
        }

        // Get source ATA if not provided
        if (!sourceATA) {
            sourceATA = await getAssociatedTokenAddress(mint, payer);
        }

        // Transfer tokens to vault
        instructions.push(
            createTransferInstruction(
                sourceATA,
                vaultATA,
                payer,
                amount
            )
        );

        // Record commitment in protocol state
        instructions.push(new TransactionInstruction({
            keys: [
                { pubkey: statePDA, isSigner: false, isWritable: true },
                { pubkey: payer, isSigner: true, isWritable: true },
                { pubkey: mint, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
            ],
            programId: this.shield.getProgramId(),
            data: Buffer.concat([
                Buffer.from([2]), // Token deposit instruction discriminator
                commitment,
                mint.toBuffer()
            ])
        }));

        return instructions;
    }

    /**
     * Build Jito tip instruction
     * Ensures transaction is sent directly to Jito validators, bypassing public mempool
     */
    private async buildJitoTip(
        payer: PublicKey,
        tipLamports: number = 10000
    ): Promise<TransactionInstruction> {
        // Select random tip account for load distribution
        const tipAccountIndex = Math.floor(Math.random() * JITO_TIP_ACCOUNTS.length);
        const tipAccount = new PublicKey(JITO_TIP_ACCOUNTS[tipAccountIndex]);

        EventBus.info(`Jito tip account selected: ${tipAccount.toBase58().slice(0, 8)}...`);

        return SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: tipAccount,
            lamports: tipLamports
        });
    }

    /**
     * Submit transaction to Jito Bundle service
     * Returns bundle ID for tracking
     */
    public async submitJitoBundle(
        transactions: VersionedTransaction[]
    ): Promise<{ bundleId: string; status: string }> {
        EventBus.info(`Submitting ${transactions.length} transactions to Jito...`);

        // Jito Bundle API endpoint
        const JITO_BUNDLE_API = 'https://mainnet.block-engine.jito.wtf/api/v1/bundles';

        try {
            const serializedTxs = transactions.map(tx =>
                Buffer.from(tx.serialize()).toString('base64')
            );

            const response = await fetch(JITO_BUNDLE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'sendBundle',
                    params: [serializedTxs]
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error.message);
            }

            const bundleId = result.result;
            EventBus.relayBroadcast(1, bundleId);
            EventBus.info(`Jito bundle submitted: ${bundleId}`);

            return {
                bundleId,
                status: 'SUBMITTED'
            };
        } catch (error) {
            EventBus.error(`Jito submission failed: ${(error as Error).message}`);
            throw error;
        }
    }
}
