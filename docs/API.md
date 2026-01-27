# SolVoid API Documentation

This document provides comprehensive API documentation for the SolVoid privacy platform, including REST endpoints, WebSocket events, and program interfaces.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [REST API](#rest-api)
- [WebSocket API](#websocket-api)
- [Program Interface](#program-interface)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The SolVoid API provides programmatic access to privacy features including:
- Privacy leak detection and scoring
- Anonymous deposit and withdrawal operations
- ZK proof generation and verification
- Real-time privacy monitoring
- Transaction relaying services

### Base URLs

- **Mainnet API**: `https://api.solvoid.io`
- **Devnet API**: `https://devnet-api.solvoid.io`
- **Relayer Service**: `https://relayer.solvoid.io`

### API Versioning

The current API version is `v1`. All requests should include the version header:

```
Accept: application/vnd.solvoid.v1+json
```

## Authentication

### API Keys

For production usage, obtain an API key from the [SolVoid Dashboard](https://dashboard.solvoid.io).

```bash
curl -H "X-API-Key: your-api-key-here" \
     -H "Accept: application/vnd.solvoid.v1+json" \
     https://api.solvoid.io/v1/passport/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

### JWT Tokens

For authenticated endpoints, use JWT tokens:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
     https://api.solvoid.io/v1/user/profile
```

## REST API

### Privacy Passport

#### GET `/v1/passport/{address}`

Retrieve the privacy passport and scoring for a Solana address.

**Parameters:**
- `address` (path, required): Solana public key in base58 format

**Response:**
```json
{
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "overallScore": 78,
  "badges": [
    {
      "id": "privacy_guardian",
      "name": "Privacy Guardian",
      "description": "Maintained >90 privacy score for 30 days",
      "icon": "🛡️",
      "earnedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metrics": {
    "depositCount": 12,
    "withdrawalCount": 8,
    "totalShielded": 150000000000,
    "averageAnonymitySet": 850000,
    "lastActivity": "2024-01-20T15:45:00Z"
  },
  "recommendations": [
    {
      "type": "improvement",
      "title": "Increase anonymity",
      "description": "Consider using larger time delays between withdrawals"
    }
  ],
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

**Example:**
```bash
curl https://api.solvoid.io/v1/passport/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

### Privacy Analysis

#### POST `/v1/analyze`

Perform comprehensive privacy analysis on an address or transaction.

**Request Body:**
```json
{
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "depth": 50,
  "includeHistorical": true,
  "analysisTypes": ["leaks", "links", "patterns", "risks"]
}
```

**Response:**
```json
{
  "requestId": "req_123456789",
  "status": "completed",
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "results": {
    "leaks": [
      {
        "severity": "HIGH",
        "type": "cex_link",
        "description": "Direct transaction to centralized exchange",
        "transaction": "5j7s83...",
        "timestamp": "2024-01-20T10:30:00Z",
        "recommendation": "Use shielded transfers via SolVoid"
      }
    ],
    "links": [
      {
        "strength": 0.85,
        "target": "ABC123...",
        "type": "temporal",
        "evidence": ["tx_1", "tx_2", "tx_3"]
      }
    ],
    "patterns": [
      {
        "name": "regular_withdrawals",
        "frequency": "weekly",
        "confidence": 0.92,
        "risk": "MEDIUM"
      }
    ],
    "overallRisk": "MEDIUM",
    "privacyScore": 65
  },
  "processingTime": 2.3,
  "completedAt": "2024-01-20T15:47:00Z"
}
```

**Example:**
```bash
curl -X POST https://api.solvoid.io/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "depth": 50,
    "includeHistorical": true
  }'
```

### Commitments

#### GET `/v1/commitments`

Retrieve all commitments from the privacy pool.

**Query Parameters:**
- `limit` (optional, default: 1000): Number of commitments to return
- `offset` (optional, default: 0): Pagination offset
- `from` (optional): Start timestamp filter
- `to` (optional): End timestamp filter

**Response:**
```json
{
  "commitments": [
    "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "789abc123def456789012345678901234567890abcdef1234567890abcdef123"
  ],
  "totalCount": 854732,
  "lastUpdated": "2024-01-20T15:45:00Z",
  "merkleRoot": "fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
  "treeDepth": 20,
  "nextIndex": 854733
}
```

**Example:**
```bash
curl "https://api.solvoid.io/v1/commitments?limit=100&from=2024-01-01T00:00:00Z"
```

#### POST `/v1/commitments`

Submit a new commitment to the privacy pool.

**Request Body:**
```json
{
  "commitment": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  "encryptedMetadata": "encrypted_base64_string",
  "signature": "signature_of_commitment"
}
```

**Response:**
```json
{
  "success": true,
  "commitmentIndex": 854733,
  "merkleRoot": "new_root_after_commitment",
  "transactionHash": "5j7s83...",
  "confirmedAt": "2024-01-20T15:48:00Z"
}
```

### Withdrawals

#### POST `/v1/withdrawals/prepare`

Prepare a withdrawal by generating ZK proof.

**Request Body:**
```json
{
  "secret": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  "nullifier": "789abc123def456789012345678901234567890abcdef1234567890abcdef123",
  "recipient": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "amount": 1500000000,
  "fee": 5000000
}
```

**Response:**
```json
{
  "status": "proof_ready",
  "proof": "8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9",
  "nullifierHash": "1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9",
  "merkleRoot": "4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2",
  "recipient": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "amount": 1500000000,
  "fee": 5000000,
  "validFor": 300
}
```

#### POST `/v1/withdrawals/execute`

Execute a prepared withdrawal.

**Request Body:**
```json
{
  "proof": "8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9",
  "nullifierHash": "1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9",
  "merkleRoot": "4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2",
  "recipient": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "amount": 1500000000,
  "fee": 5000000
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "5j7s83...",
  "nullifierHash": "1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9",
  "executedAt": "2024-01-20T15:50:00Z",
  "blockNumber": 123456789,
  "gasUsed": 25000
}
```

### Relayer Service

#### GET `/relayer/v1/status`

Check relayer service status and health.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "activeConnections": 42,
  "queueSize": 5,
  "averageLatency": 150,
  "supportedNetworks": ["mainnet-beta", "devnet"],
  "fees": {
    "base": 5000000,
    "priority": 10000000,
    "expedited": 25000000
  }
}
```

#### POST `/relayer/v1/broadcast`

Broadcast a transaction through the shadow relayer network.

**Request Body:**
```json
{
  "transaction": "base64_encoded_transaction",
  "priority": "normal",
  "maxDelay": 300,
  "retryCount": 3
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "5j7s83...",
  "broadcastAt": "2024-01-20T15:52:00Z",
  "confirmedAt": "2024-01-20T15:52:35Z",
  "relayerUsed": "relayer-3-eu-west",
  "latency": 35
}
```

### Analytics

#### GET `/v1/analytics/privacy`

Get privacy analytics and metrics.

**Query Parameters:**
- `period` (optional, default: "24h"): Time period (1h, 24h, 7d, 30d)
- `metric` (optional): Specific metric to retrieve

**Response:**
```json
{
  "period": "24h",
  "metrics": {
    "totalDeposits": 1250,
    "totalWithdrawals": 980,
    "totalVolume": 5000000000000,
    "averageAnonymitySet": 750000,
    "averageProofTime": 2.3,
    "privacyScoreDistribution": {
      "excellent": 15,
      "good": 35,
      "fair": 30,
      "poor": 20
    }
  },
  "trends": {
    "volumeChange": 12.5,
    "anonymityChange": -2.1,
    "privacyScoreChange": 5.8
  }
}
```

## WebSocket API

### Connection

Connect to the WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('wss://api.solvoid.io/v1/ws');
```

### Authentication

After connecting, authenticate with your API key:

```javascript
ws.send(JSON.stringify({
  type: 'auth',
  apiKey: 'your-api-key-here'
}));
```

### Events

#### New Commitment

```json
{
  "type": "new_commitment",
  "data": {
    "commitment": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "index": 854734,
    "timestamp": "2024-01-20T15:53:00Z",
    "merkleRoot": "new_root_hash"
  }
}
```

#### Withdrawal Executed

```json
{
  "type": "withdrawal_executed",
  "data": {
    "transactionHash": "5j7s83...",
    "nullifierHash": "1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9",
    "amount": 1500000000,
    "recipient": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "timestamp": "2024-01-20T15:54:00Z"
  }
}
```

#### Privacy Alert

```json
{
  "type": "privacy_alert",
  "data": {
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "severity": "HIGH",
    "alertType": "leak_detected",
    "description": "Potential privacy leak detected",
    "recommendation": "Immediate shielding recommended",
    "timestamp": "2024-01-20T15:55:00Z"
  }
}
```

### Subscriptions

Subscribe to specific events:

```javascript
// Subscribe to all events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'all'
}));

// Subscribe to specific address events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'address',
  address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
}));

// Subscribe to privacy alerts
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'alerts',
  severity: ['HIGH', 'CRITICAL']
}));
```

## Program Interface

### Program ID

```
Mainnet: Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i
Devnet: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

### Instructions

#### Initialize

Initialize the privacy program.

```rust
pub fn initialize(
    ctx: Context<Initialize>,
    amount: u64,
    withdraw_vk: Vec<u8>,
    deposit_vk: Vec<u8>
) -> Result<()>
```

**Parameters:**
- `amount`: Initial deposit amount
- `withdraw_vk`: Withdrawal verification key
- `deposit_vk`: Deposit verification key

#### Deposit

Make a private deposit.

```rust
pub fn deposit(
    ctx: Context<Deposit>,
    commitment: [u8; 32]
) -> Result<()>
```

**Parameters:**
- `commitment`: Poseidon hash of secret and nullifier

#### Withdraw

Make an anonymous withdrawal.

```rust
pub fn withdraw(
    ctx: Context<Withdraw>,
    nullifier_hash: [u8; 32],
    root: [u8; 32],
    proof: Vec<u8>,
    fee: u64
) -> Result<()>
```

**Parameters:**
- `nullifier_hash`: Hash of nullifier to prevent double-spending
- `root`: Merkle root of commitment tree
- `proof`: ZK-SNARK proof
- `fee`: Relayer fee in lamports

### Accounts

#### GlobalState

```rust
pub struct GlobalState {
    pub is_initialized: bool,
    pub deposit_amount: u64,
    pub next_index: u64,
    pub root: [u8; 32],
    pub filled_subtrees: [[u8; 32]; 20],
    pub zeros: [[u8; 32]; 20],
    pub total_deposits: u64,
    pub total_withdrawn: u64,
    pub pause_withdrawals: bool,
    pub economic_state: EconomicState,
}
```

#### NullifierRecord

```rust
pub struct NullifierRecord {
    pub nullifier_hash: [u8; 32],
    pub timestamp: i64,
}
```

### Events

#### DepositEvent

```rust
#[event]
pub struct DepositEvent {
    pub commitment: [u8; 32],
    pub leaf_index: u64,
    pub root: [u8; 32],
}
```

#### WithdrawalEvent

```rust
#[event]
pub struct WithdrawalEvent {
    pub nullifier_hash: [u8; 32],
    pub recipient: Pubkey,
    pub fee: u64,
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_COMMITMENT",
    "message": "Commitment format is invalid",
    "details": {
      "field": "commitment",
      "expected": "32-byte hex string",
      "received": "invalid_string"
    },
    "requestId": "req_123456789",
    "timestamp": "2024-01-20T15:56:00Z"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_ADDRESS` | Invalid Solana address format |
| `INVALID_COMMITMENT` | Invalid commitment format |
| `COMMITMENT_NOT_FOUND` | Commitment not in Merkle tree |
| `INVALID_PROOF` | ZK proof verification failed |
| `DUPLICATE_NULLIFIER` | Nullifier already used |
| `INSUFFICIENT_FUNDS` | Insufficient balance for operation |
| `RATE_LIMITED` | API rate limit exceeded |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## Rate Limiting

### Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/v1/passport/*` | 100 requests | 1 minute |
| `/v1/analyze` | 10 requests | 1 minute |
| `/v1/commitments` | 1000 requests | 1 minute |
| `/v1/withdrawals/*` | 20 requests | 1 minute |
| WebSocket | 100 connections | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705789200
```

### Backoff Strategy

Implement exponential backoff when rate limited:

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    if (error.status === 429) {
      const resetTime = error.headers.get('X-RateLimit-Reset');
      const waitTime = Math.max(1000, (resetTime - Date.now()) * 1000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return apiCall(url, options);
    }
    throw error;
  }
}
```

## Examples

### Complete Privacy Flow

```javascript
import { SolVoidClient } from 'solvoid';

// Initialize client
const client = new SolVoidClient({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  programId: 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i',
  relayerUrl: 'https://relayer.solvoid.io'
}, wallet);

// 1. Check privacy passport
const passport = await client.getPassport(address);
console.log(`Privacy Score: ${passport.overallScore}/100`);

// 2. Shield assets
const { commitmentData } = await client.shield(1_500_000_000);
console.log(`Secret: ${commitmentData.secret}`);

// 3. Wait for confirmation
await new Promise(resolve => setTimeout(resolve, 30000));

// 4. Withdraw anonymously
const commitments = await fetch('https://api.solvoid.io/v1/commitments')
  .then(r => r.json())
  .then(d => d.commitments);

const withdrawal = await client.prepareWithdrawal(
  commitmentData.secret,
  commitmentData.nullifier,
  recipient,
  commitments,
  './withdraw.wasm',
  './withdraw.zkey'
);

console.log(`Proof ready: ${withdrawal.proof.length} bytes`);
```

### Real-time Monitoring

```javascript
const ws = new WebSocket('wss://api.solvoid.io/v1/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'your-api-key'
  }));
  
  // Subscribe to alerts
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'alerts',
    severity: ['HIGH', 'CRITICAL']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'privacy_alert':
      console.log(`🚨 Privacy Alert: ${data.data.description}`);
      // Trigger automated response
      handlePrivacyAlert(data.data);
      break;
      
    case 'new_commitment':
      console.log(`New commitment: ${data.data.commitment}`);
      break;
      
    case 'withdrawal_executed':
      console.log(`Withdrawal: ${data.data.transactionHash}`);
      break;
  }
};

function handlePrivacyAlert(alert) {
  if (alert.severity === 'CRITICAL') {
    // Immediate shielding
    client.rescue(new PublicKey(alert.address));
  }
}
```

### Batch Analysis

```javascript
async function batchAnalyze(addresses) {
  const results = await Promise.allSettled(
    addresses.map(address => 
      fetch(`https://api.solvoid.io/v1/passport/${address}`)
        .then(r => r.json())
    )
  );
  
  const summary = {
    total: addresses.length,
    analyzed: results.filter(r => r.status === 'fulfilled').length,
    averageScore: 0,
    highRiskAddresses: []
  };
  
  let totalScore = 0;
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const passport = result.value;
      totalScore += passport.overallScore;
      
      if (passport.overallScore < 50) {
        summary.highRiskAddresses.push({
          address: addresses[index],
          score: passport.overallScore
        });
      }
    }
  });
  
  summary.averageScore = Math.round(totalScore / summary.analyzed);
  return summary;
}

// Usage
const addresses = [
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567890ABC123DEF'
];

const analysis = await batchAnalyze(addresses);
console.log(`Average Privacy Score: ${analysis.averageScore}/100`);
console.log(`High Risk Addresses: ${analysis.highRiskAddresses.length}`);
```

---

For additional support and examples, visit our [GitHub repository](https://github.com/solvoid/solvoid) or join our [Discord community](https://discord.gg/solvoid).
