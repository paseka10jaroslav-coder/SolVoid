import express from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { PrivacyIndexer } from './indexer';
import winston from 'winston';
import 'dotenv/config';



const app = express();
const port = process.env.PORT || 3000;
const RPC_URL = process.env.RPC_URL;
if (!RPC_URL) {
    throw new Error("RPC_URL environment variable is required");
}
const connection = new Connection(RPC_URL, 'confirmed');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()]
});

app.use(express.json());

const PROGRAM_ID = process.env.PROGRAM_ID;
if (!PROGRAM_ID) {
    throw new Error("PROGRAM_ID environment variable is required");
}

const indexer = new PrivacyIndexer(
    connection,
    {},
    PROGRAM_ID
);

/**
 * Endpoint for real-time tx notifications (e.g. via Helius Geyser)
 */
app.post('/webhook', async (req, res) => {
    const transactions = req.body;
    logger.info(`Processing ${transactions.length} inbound transactions`);

    // Sync state to pick up new commitments
    await indexer.sync();
    res.status(200).send('OK');
});

/**
 * Fetch commitments for local Merkle path construction
 */
app.get('/commitments', (req, res) => {
    const commitments = indexer.getCommitments();
    res.json({
        commitments: commitments.map(c => c.toString('hex')),
        root: '...'
    });
});

/**
 * Handle ZK-proof submission on behalf of the user
 */
app.post('/relay-withdraw', async (req, res) => {
    const { proof, nullifierHash, root, recipient, fee } = req.body;

    logger.info(`Withdrawal request for recipient ${recipient}`);

    res.json({ status: 'pending', txid: 'TX_SIG_HERE' });
});

app.listen(port, () => {
    logger.info(`Relayer started on port ${port}`);
    indexer.sync();
});
