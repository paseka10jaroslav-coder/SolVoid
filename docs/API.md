# SolVoid API Documentation

## API Overview

SolVoid provides a comprehensive REST API and SDK for integrating privacy-preserving transactions into applications. The API supports zero-knowledge proof generation, transaction submission, privacy scoring, and compliance monitoring.

## Base Configuration

### API Endpoints
```
Production: https://api.solvoid.dev/v1
Staging: https://staging-api.solvoid.dev/v1
Development: https://dev-api.solvoid.dev/v1
```

### Authentication
```typescript
// API Key Authentication
const config = {
    apiKey: 'your-api-key-here',
    baseUrl: 'https://api.solvoid.dev/v1',
    timeout: 30000,
};

// JWT Token Authentication
const headers = {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
    'X-API-Version': '1.1.0',
};
```

## Core API Methods

### Privacy Operations

#### Shield Transaction
```typescript
interface ShieldRequest {
    amount: number;           // Transaction amount in lamports
    recipient?: string;      // Optional recipient address
    memo?: string;          // Optional transaction memo
    privacyLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // Privacy preferences
}

interface ShieldResponse {
    transactionId: string;    // Unique transaction identifier
    commitment: string;      // Merkle tree commitment
    merkleIndex: number;     // Position in Merkle tree
    timestamp: string;       // Transaction timestamp
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

// API Call
POST /shield
Content-Type: application/json

{
    "amount": 1000000,
    "privacyLevel": "HIGH",
    "memo": "Private transfer"
}

// Response
{
    "transactionId": "tx_1234567890abcdef",
    "commitment": "0x1234567890abcdef...",
    "merkleIndex": 12345,
    "timestamp": "2026-01-29T06:20:00Z",
    "status": "PENDING"
}
```

#### Unshield Transaction
```typescript
interface UnshieldRequest {
    proof: {
        a: string[];         // Proof A parameter
        b: string[][];       // Proof B parameter
        c: string[];         // Proof C parameter
    };
    publicInputs: {
        nullifierHash: string;  // Nullifier hash
        merkleRoot: string;     // Merkle root
        amount: number;         // Withdrawal amount
        recipient: string;      // Recipient address
    };
    recipient: string;       // Destination address
    memo?: string;          // Optional transaction memo
}

interface UnshieldResponse {
    transactionId: string;    // Unique transaction identifier
    nullifierHash: string;    // Nullifier hash (for tracking)
    timestamp: string;       // Transaction timestamp
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

// API Call
POST /unshield
Content-Type: application/json

{
    "proof": {
        "a": ["0x1234...", "0x5678..."],
        "b": [["0xabcd...", "0xefgh..."], ["0ijkl...", "0mnop..."]],
        "c": ["0qrst...", "0uvwx..."]
    },
    "publicInputs": {
        "nullifierHash": "0x1234567890abcdef...",
        "merkleRoot": "0xfedcba0987654321...",
        "amount": 500000,
        "recipient": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    },
    "recipient": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
}
```

### Compliance Operations

#### Privacy Score
```typescript
interface PrivacyScoreRequest {
    address: string;         // Wallet address to score
    timeframe?: {           // Optional time window
        start: string;      // ISO 8601 start time
        end: string;        // ISO 8601 end time
    };
    includeHistory: boolean; // Include historical scores
}

interface PrivacyScoreResponse {
    address: string;
    currentScore: number;     // 0-100 privacy score
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    scoreBreakdown: {
        transactionPattern: number;
        timingAnalysis: number;
        amountDistribution: number;
        networkBehavior: number;
    };
    historicalScores: {
        timestamp: string;
        score: number;
        riskLevel: string;
    }[];
    recommendations: string[];
}

// API Call
POST /privacy-score
Content-Type: application/json

{
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "timeframe": {
        "start": "2026-01-01T00:00:00Z",
        "end": "2026-01-29T00:00:00Z"
    },
    "includeHistory": true
}
```

#### Transaction Scan
```typescript
interface ScanRequest {
    address: string;         // Address to scan
    depth: number;          // Scan depth (blocks)
    includePrivate: boolean; // Include private transactions
    complianceLevel: 'BASIC' | 'STANDARD' | 'ENHANCED';
}

interface ScanResponse {
    address: string;
    totalTransactions: number;
    privateTransactions: number;
    publicTransactions: number;
    totalVolume: number;
    averagePrivacyScore: number;
    riskIndicators: {
        suspiciousPatterns: string[];
        highRiskTransactions: string[];
        complianceFlags: string[];
    };
    transactions: Transaction[];
}

// API Call
POST /scan
Content-Type: application/json

{
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "depth": 1000,
    "includePrivate": true,
    "complianceLevel": "ENHANCED"
}
```

### Rescue Operations

#### Initiate Rescue
```typescript
interface RescueRequest {
    compromisedAddress: string;  // Compromised wallet address
    newAddress: string;          // New secure address
    rescueAmount: number;        // Amount to rescue
    signatures: string[];        // Multi-signature approvals
    evidence: {                  // Compromise evidence
        incidentType: string;
        incidentDate: string;
        description: string;
        supportingDocuments: string[];
    };
}

interface RescueResponse {
    rescueId: string;           // Unique rescue identifier
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    requiredSignatures: number;  // Signatures required
    receivedSignatures: number; // Signatures received
    estimatedCompletion: string; // ETA for rescue completion
}

// API Call
POST /rescue/initiate
Content-Type: application/json

{
    "compromisedAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "newAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "rescueAmount": 10000000,
    "signatures": ["signature1", "signature2", "signature3"],
    "evidence": {
        "incidentType": "PRIVATE_KEY_COMPROMISE",
        "incidentDate": "2026-01-28T10:00:00Z",
        "description": "Private key exposed through phishing attack",
        "supportingDocuments": ["doc1.pdf", "doc2.pdf"]
    }
}
```

#### Complete Rescue
```typescript
interface CompleteRescueRequest {
    rescueId: string;           // Rescue operation ID
    finalSignatures: string[];  // Remaining required signatures
    proof: ZKProof;            // Zero-knowledge proof for rescue
}

interface CompleteRescueResponse {
    rescueId: string;
    transactionId: string;     // Rescue transaction ID
    status: 'COMPLETED' | 'FAILED';
    rescuedAmount: number;      // Amount successfully rescued
    timestamp: string;         // Completion timestamp
}

// API Call
POST /rescue/complete
Content-Type: application/json

{
    "rescueId": "rescue_1234567890",
    "finalSignatures": ["signature4", "signature5"],
    "proof": {
        "a": ["0x1234...", "0x5678..."],
        "b": [["0xabcd...", "0xefgh..."], ["0ijkl...", "0mnop..."]],
        "c": ["0qrst...", "0uvwx..."]
    }
}
```

## SDK Integration

### TypeScript SDK
```typescript
import { SolVoidSDK, SolVoidConfig } from '@solvoid/sdk';

// Initialize SDK
const config: SolVoidConfig = {
    apiKey: 'your-api-key',
    network: 'mainnet',
    timeout: 30000,
};

const solvoid = new SolVoidSDK(config);

// Shield transaction
const shieldResult = await solvoid.shield({
    amount: 1000000,
    privacyLevel: 'HIGH',
});

// Unshield transaction
const unshieldResult = await solvoid.unshield({
    proof: zkProof,
    recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
});

// Get privacy score
const privacyScore = await solvoid.getPrivacyScore({
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
});

// Scan transactions
const scanResult = await solvoid.scanTransactions({
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    depth: 1000,
});
```

### JavaScript SDK
```javascript
const { SolVoidSDK } = require('@solvoid/sdk');

// Initialize SDK
const solvoid = new SolVoidSDK({
    apiKey: 'your-api-key',
    network: 'mainnet',
});

// Async/await usage
async function performPrivateTransaction() {
    try {
        // Shield funds
        const shieldResult = await solvoid.shield({
            amount: 1000000,
            privacyLevel: 'HIGH',
        });
        
        console.log('Shield transaction:', shieldResult.transactionId);
        
        // Unshield funds
        const unshieldResult = await solvoid.unshield({
            proof: generatedProof,
            recipient: 'recipient-address',
        });
        
        console.log('Unshield transaction:', unshieldResult.transactionId);
    } catch (error) {
        console.error('Transaction failed:', error.message);
    }
}
```

### Python SDK
```python
from solvoid import SolVoidSDK
import asyncio

async def main():
    # Initialize SDK
    solvoid = SolVoidSDK(
        api_key='your-api-key',
        network='mainnet'
    )
    
    # Shield transaction
    shield_result = await solvoid.shield(
        amount=1000000,
        privacy_level='HIGH'
    )
    
    print(f"Shield transaction: {shield_result.transaction_id}")
    
    # Get privacy score
    privacy_score = await solvoid.get_privacy_score(
        address='9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    )
    
    print(f"Privacy score: {privacy_score.current_score}")

asyncio.run(main())
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
    error: {
        code: string;           // Error code
        message: string;        // Human-readable error message
        details?: any;          // Additional error details
        timestamp: string;      // Error timestamp
        requestId: string;      // Request identifier for support
    };
}
```

### Common Error Codes
```typescript
enum ErrorCode {
    // Authentication errors
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_API_KEY = 'INVALID_API_KEY',
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
    
    // Validation errors
    INVALID_REQUEST = 'INVALID_REQUEST',
    INVALID_AMOUNT = 'INVALID_AMOUNT',
    INVALID_ADDRESS = 'INVALID_ADDRESS',
    INVALID_PROOF = 'INVALID_PROOF',
    
    // Transaction errors
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    TRANSACTION_FAILED = 'TRANSACTION_FAILED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    
    // Compliance errors
    PRIVACY_SCORE_TOO_LOW = 'PRIVACY_SCORE_TOO_LOW',
    TRANSACTION_LIMIT_EXCEEDED = 'TRANSACTION_LIMIT_EXCEEDED',
    COMPLIANCE_FLAG = 'COMPLIANCE_FLAG',
    
    // System errors
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### Error Handling Examples
```typescript
try {
    const result = await solvoid.shield({
        amount: 1000000,
        privacyLevel: 'HIGH',
    });
} catch (error) {
    if (error.code === ErrorCode.INSUFFICIENT_BALANCE) {
        console.error('Insufficient balance for transaction');
    } else if (error.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
        console.error('Rate limit exceeded, please try again later');
    } else {
        console.error('Unexpected error:', error.message);
    }
}
```

## Rate Limiting

### Rate Limits by Plan
| Plan | Requests/Minute | Requests/Hour | Features |
|------|----------------|---------------|----------|
| Basic | 60 | 1000 | Standard privacy operations |
| Professional | 300 | 5000 | Advanced compliance features |
| Enterprise | 1000 | 20000 | Full API access, priority support |

### Rate Limit Headers
```typescript
interface RateLimitHeaders {
    'X-RateLimit-Limit': string;     // Total requests allowed
    'X-RateLimit-Remaining': string; // Requests remaining
    'X-RateLimit-Reset': string;     // Reset timestamp
}
```

## Webhooks

### Webhook Configuration
```typescript
interface WebhookConfig {
    url: string;              // Webhook endpoint URL
    events: string[];         // Events to subscribe to
    secret: string;           // Webhook secret for verification
    active: boolean;          // Webhook activation status
}

// Supported events
enum WebhookEvent {
    TRANSACTION_COMPLETED = 'transaction.completed',
    TRANSACTION_FAILED = 'transaction.failed',
    PRIVACY_SCORE_UPDATED = 'privacy_score.updated',
    RESCUE_COMPLETED = 'rescue.completed',
    COMPLIANCE_ALERT = 'compliance.alert',
}
```

### Webhook Payload Format
```typescript
interface WebhookPayload {
    eventId: string;          // Unique event identifier
    eventType: string;        // Event type
    timestamp: string;         // Event timestamp
    data: any;                // Event-specific data
    signature: string;        // HMAC signature for verification
}

// Verify webhook signature
function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
```

## Testing and Development

### Test Environment
```typescript
// Test configuration
const testConfig: SolVoidConfig = {
    apiKey: 'test-api-key',
    network: 'devnet',
    timeout: 10000,
};

// Mock data for testing
const mockProof = {
    a: ['0x1234...', '0x5678...'],
    b: [['0xabcd...', '0xefgh...'], ['0ijkl...', '0mnop...']],
    c: ['0qrst...', '0uvwx...'],
};
```

### Integration Tests
```typescript
describe('SolVoid API Integration', () => {
    test('Shield and unshield flow', async () => {
        // Shield transaction
        const shieldResult = await solvoid.shield({
            amount: 1000000,
            privacyLevel: 'HIGH',
        });
        
        expect(shieldResult.status).toBe('CONFIRMED');
        
        // Generate proof for unshield
        const proof = await generateUnshieldProof(shieldResult.commitment);
        
        // Unshield transaction
        const unshieldResult = await solvoid.unshield({
            proof: proof,
            recipient: testRecipient,
        });
        
        expect(unshieldResult.status).toBe('CONFIRMED');
    });
});
```

## Monitoring and Analytics

### API Metrics
```typescript
interface APIMetrics {
    requestCount: number;        // Total API requests
    errorRate: number;           // Error percentage
    averageResponseTime: number; // Average response time
    p95ResponseTime: number;     // 95th percentile response time
    uptime: number;              // Service uptime percentage
}
```

### Analytics Endpoints
```typescript
// Get usage statistics
GET /analytics/usage
{
    "period": "2026-01-01 to 2026-01-29",
    "totalTransactions": 1250,
    "totalVolume": 1250000000,
    "averagePrivacyScore": 78.5,
    "complianceRate": 99.2
}

// Get performance metrics
GET /analytics/performance
{
    "averageResponseTime": 245,
    "p95ResponseTime": 1200,
    "errorRate": 0.02,
    "uptime": 99.98
}
```

---

*API Documentation Version: 1.1.0 | Last Updated: January 2026*
