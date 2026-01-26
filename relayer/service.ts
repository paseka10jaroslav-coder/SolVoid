#!/usr/bin/env node

/**
 * SolVoid Shadow Relayer Service
 * 
 * Standalone Node.js microservice for IP-anonymous transaction broadcasting.
 * Implements onion-style routing between multiple relay nodes.
 * 
 * Usage:
 *   npx ts-node relayer/service.ts --port 8080
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { Connection, VersionedTransaction } from '@solana/web3.js';

// Configuration
const PORT = parseInt(process.env.PORT || '8080');
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
const NODE_ID = process.env.NODE_ID || `shadow-${crypto.randomBytes(4).toString('hex')}`;
const BOUNTY_RATE = parseFloat(process.env.BOUNTY_RATE || '0.001'); // SOL per relay

interface RelayerNode {
    id: string;
    endpoint: string;
    publicKey: string;
    lastSeen: number;
    bountyRate: number;
    successRate: number;
    region: string;
}

interface RelayRequest {
    transaction: string; // Base64 encoded
    hops: number;
    targetNode?: string;
    encryptedPayload?: string;
}

interface RelayResponse {
    success: boolean;
    txid?: string;
    hopCount?: number;
    error?: string;
    relayPath?: string[];
}

interface OnionLayer {
    nextHop: string;
    payload: string;
    nonce: string;
}

// In-memory peer registry (would be distributed in production)
const peerRegistry: Map<string, RelayerNode> = new Map();

// Transaction metrics
const metrics = {
    relayed: 0,
    failed: 0,
    totalBounty: 0,
    uptime: Date.now()
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Solana connection
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        nodeId: NODE_ID,
        uptime: Math.floor((Date.now() - metrics.uptime) / 1000),
        metrics: {
            relayed: metrics.relayed,
            failed: metrics.failed,
            successRate: metrics.relayed / (metrics.relayed + metrics.failed || 1),
            totalBounty: metrics.totalBounty
        },
        peers: peerRegistry.size,
        bountyRate: BOUNTY_RATE
    });
});

/**
 * Get list of known relay peers
 */
app.get('/peers', (_req: Request, res: Response) => {
    const peers = Array.from(peerRegistry.values()).map(p => ({
        id: p.id,
        region: p.region,
        bountyRate: p.bountyRate,
        successRate: p.successRate,
        online: Date.now() - p.lastSeen < 60000
    }));
    res.json({ peers });
});

/**
 * Register as a peer relay
 */
app.post('/register', (req: Request, res: Response) => {
    const { endpoint, publicKey, region, bountyRate } = req.body;

    if (!endpoint || !publicKey) {
        res.status(400).json({ error: 'Missing endpoint or publicKey' });
        return;
    }

    const nodeId = `peer-${crypto.createHash('sha256').update(publicKey).digest('hex').slice(0, 8)}`;

    peerRegistry.set(nodeId, {
        id: nodeId,
        endpoint,
        publicKey,
        lastSeen: Date.now(),
        bountyRate: bountyRate || BOUNTY_RATE,
        successRate: 1.0,
        region: region || 'UNKNOWN'
    });

    console.log(`[REGISTRY] Peer registered: ${nodeId} (${region})`);
    res.json({ registered: true, nodeId });
});

/**
 * Relay transaction through onion routing
 */
app.post('/relay', async (req: Request, res: Response) => {
    const { transaction, hops, targetNode, encryptedPayload } = req.body as RelayRequest;

    console.log(`[RELAY] Incoming request - hops: ${hops}`);

    try {
        // Handle onion-encrypted payload
        if (encryptedPayload) {
            const result = await handleOnionRelay(encryptedPayload);
            res.json(result);
            return;
        }

        // Direct relay
        if (!transaction) {
            res.status(400).json({ error: 'Missing transaction data' });
            return;
        }

        // Decode transaction
        const txBuffer = Buffer.from(transaction, 'base64');
        const tx = VersionedTransaction.deserialize(txBuffer);

        let result: RelayResponse;

        if (hops > 1 && peerRegistry.size > 0) {
            // Multi-hop relay
            result = await multiHopRelay(tx, hops - 1, targetNode);
        } else {
            // Final hop - broadcast to Solana
            result = await broadcastTransaction(tx);
        }

        if (result.success) {
            metrics.relayed++;
            metrics.totalBounty += BOUNTY_RATE;
        } else {
            metrics.failed++;
        }

        res.json(result);
    } catch (error) {
        metrics.failed++;
        console.error('[RELAY] Error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * Handle onion-encrypted relay
 */
async function handleOnionRelay(encryptedPayload: string): Promise<RelayResponse> {
    try {
        // Decrypt current layer
        const layer = decryptOnionLayer(encryptedPayload);

        if (layer.nextHop === 'FINAL') {
            // This is the final hop, broadcast
            const txBuffer = Buffer.from(layer.payload, 'base64');
            const tx = VersionedTransaction.deserialize(txBuffer);
            return broadcastTransaction(tx);
        } else {
            // Forward to next hop
            const peer = peerRegistry.get(layer.nextHop);
            if (!peer) {
                return { success: false, error: 'Next hop peer not found' };
            }

            const response = await fetch(`${peer.endpoint}/relay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encryptedPayload: layer.payload })
            });

            return await response.json();
        }
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Decrypt one layer of onion encryption
 */
function decryptOnionLayer(encrypted: string): OnionLayer {
    // In production, this would use proper asymmetric encryption
    // For now, we use a simple encoding scheme
    try {
        const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch {
        // Treat as final payload
        return { nextHop: 'FINAL', payload: encrypted, nonce: '' };
    }
}

/**
 * Multi-hop relay with random peer selection
 */
async function multiHopRelay(
    tx: VersionedTransaction,
    remainingHops: number,
    preferredNode?: string
): Promise<RelayResponse> {
    // Select next peer
    let nextPeer: RelayerNode | undefined;

    if (preferredNode && peerRegistry.has(preferredNode)) {
        nextPeer = peerRegistry.get(preferredNode);
    } else {
        // Random selection weighted by success rate
        const activePeers = Array.from(peerRegistry.values())
            .filter(p => Date.now() - p.lastSeen < 60000);

        if (activePeers.length > 0) {
            const totalWeight = activePeers.reduce((sum, p) => sum + p.successRate, 0);
            let random = Math.random() * totalWeight;

            for (const peer of activePeers) {
                random -= peer.successRate;
                if (random <= 0) {
                    nextPeer = peer;
                    break;
                }
            }
        }
    }

    if (!nextPeer) {
        // No peers available, broadcast directly
        console.log('[RELAY] No peers available, broadcasting directly');
        return broadcastTransaction(tx);
    }

    console.log(`[RELAY] Forwarding to peer: ${nextPeer.id}`);

    // Forward to next peer
    try {
        const response = await fetch(`${nextPeer.endpoint}/relay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transaction: Buffer.from(tx.serialize()).toString('base64'),
                hops: remainingHops
            })
        });

        const result: RelayResponse = await response.json();

        // Update peer success rate
        if (result.success) {
            nextPeer.successRate = Math.min(1, nextPeer.successRate + 0.01);
        } else {
            nextPeer.successRate = Math.max(0.5, nextPeer.successRate - 0.1);
        }
        nextPeer.lastSeen = Date.now();

        return {
            ...result,
            relayPath: [NODE_ID, ...(result.relayPath || [])]
        };
    } catch (error) {
        // Peer failed, try direct broadcast
        console.log(`[RELAY] Peer ${nextPeer.id} failed, broadcasting directly`);
        nextPeer.successRate = Math.max(0.5, nextPeer.successRate - 0.2);
        return broadcastTransaction(tx);
    }
}

/**
 * Broadcast transaction to Solana network
 */
async function broadcastTransaction(tx: VersionedTransaction): Promise<RelayResponse> {
    try {
        // Add random jitter for timing correlation protection
        const jitter = Math.floor(Math.random() * 200) + 50;
        await new Promise(resolve => setTimeout(resolve, jitter));

        const rawTransaction = tx.serialize();
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 3
        });

        console.log(`[BROADCAST] Success: ${txid}`);

        return {
            success: true,
            txid,
            hopCount: 1,
            relayPath: [NODE_ID]
        };
    } catch (error) {
        console.error('[BROADCAST] Failed:', error);
        return {
            success: false,
            error: (error as Error).message
        };
    }
}

/**
 * Build onion-encrypted payload for multi-hop routing
 */
app.post('/encrypt-route', (req: Request, res: Response) => {
    const { transaction, route } = req.body; // route = array of node IDs

    if (!transaction || !route || route.length === 0) {
        res.status(400).json({ error: 'Missing transaction or route' });
        return;
    }

    let payload = transaction;

    // Wrap in onion layers (reverse order)
    for (let i = route.length - 1; i >= 0; i--) {
        const layer: OnionLayer = {
            nextHop: i === route.length - 1 ? 'FINAL' : route[i + 1],
            payload,
            nonce: crypto.randomBytes(16).toString('hex')
        };
        payload = Buffer.from(JSON.stringify(layer)).toString('base64');
    }

    res.json({ encrypted: payload, hops: route.length });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log('═'.repeat(60));
    console.log(`  🛡️  SolVoid Shadow Relayer`);
    console.log(`  Node ID: ${NODE_ID}`);
    console.log(`  Port: ${PORT}`);
    console.log(`  RPC: ${RPC_ENDPOINT.slice(0, 40)}...`);
    console.log(`  Bounty Rate: ${BOUNTY_RATE} SOL/relay`);
    console.log('═'.repeat(60));
    console.log('Ready for anonymous transaction relay...\n');
});

export { app, peerRegistry, metrics };
