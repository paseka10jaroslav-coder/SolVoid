# SolVoid SDK Documentation

The SolVoid SDK provides a comprehensive TypeScript/JavaScript library for integrating privacy features into your applications. This guide covers installation, configuration, and usage patterns.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Classes](#core-classes)
- [Configuration](#configuration)
- [Privacy Operations](#privacy-operations)
- [Event Handling](#event-handling)
- [Advanced Usage](#advanced-usage)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

## Installation

### npm

```bash
npm install solvoid
```

### yarn

```bash
yarn add solvoid
```

### pnpm

```bash
pnpm add solvoid
```

### Peer Dependencies

The SDK requires these peer dependencies:

```bash
npm install @solana/web3.js @coral-xyz/anchor
```

### Browser Usage

For browser environments, ensure you have the required polyfills:

```html
<script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
<script src="https://unpkg.com/solvoid@latest/dist/index.umd.js"></script>
```

## Quick Start

### Basic Setup

```typescript
import { SolVoidClient, SolVoidConfig } from 'solvoid';
import { Connection, Keypair } from '@solana/web3.js';

// Configure the client
const config: SolVoidConfig = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  programId: 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i',
  relayerUrl: 'https://relayer.solvoid.io'
};

// Create wallet adapter
const wallet = Keypair.generate();

// Initialize client
const client = new SolVoidClient(config, wallet);

// Scan for privacy leaks
const results = await client.protect(wallet.publicKey);
console.log(`Privacy score: ${results[0]?.privacyScore || 100}/100`);
```

### React Integration

```tsx
import React, { useState, useEffect } from 'react';
import { SolVoidClient, useSolVoid } from 'solvoid';
import { useWallet } from '@solana/wallet-adapter-react';

function PrivacyDashboard() {
  const { publicKey } = useWallet();
  const { client, isLoading } = useSolVoid({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    programId: 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i'
  });
  
  const [passport, setPassport] = useState(null);

  useEffect(() => {
    if (client && publicKey) {
      client.getPassport(publicKey.toBase58()).then(setPassport);
    }
  }, [client, publicKey]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Privacy Score: {passport?.overallScore || 0}/100</h2>
      <div>
        {passport?.badges.map(badge => (
          <span key={badge.id} title={badge.description}>
            {badge.icon} {badge.name}
          </span>
        ))}
      </div>
    </div>
  );
}
```

## Core Classes

### SolVoidClient

The main client class for interacting with SolVoid privacy features.

#### Constructor

```typescript
constructor(config: SolVoidConfig, wallet: WalletAdapter, options?: ClientOptions)
```

**Parameters:**
- `config`: Configuration object
- `wallet`: Wallet adapter implementing the WalletAdapter interface
- `options`: Optional client options

#### Configuration Interface

```typescript
interface SolVoidConfig {
  readonly rpcUrl: string;
  readonly programId: string;
  readonly relayerUrl?: string;
  readonly commitment?: Commitment;
  readonly preflightCommitment?: Commitment;
}
```

#### Client Options

```typescript
interface ClientOptions {
  readonly debug?: boolean;
  readonly timeout?: number;
  readonly retryAttempts?: number;
  readonly retryDelay?: number;
}
```

### WalletAdapter

Interface for wallet implementations:

```typescript
interface WalletAdapter {
  readonly publicKey: PublicKey | null;
  readonly signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
  readonly signAllTransactions: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
}
```

### Built-in Wallet Adapters

#### KeypairAdapter

```typescript
import { KeypairAdapter } from 'solvoid';

const keypair = Keypair.generate();
const adapter = new KeypairAdapter(keypair);
const client = new SolVoidClient(config, adapter);
```

#### PhantomAdapter

```typescript
import { PhantomAdapter } from 'solvoid';

const adapter = new PhantomAdapter();
const client = new SolVoidClient(config, adapter);
```

## Configuration

### Environment-based Configuration

```typescript
import { SolVoidClient } from 'solvoid';

// Auto-load from environment
const client = SolVoidClient.fromEnvironment(wallet);

// Or specify environment prefix
const client = SolVoidClient.fromEnvironment(wallet, 'SOLVOID_');
```

Environment variables:
```bash
SOLVOID_RPC_URL=https://api.mainnet-beta.solana.com
SOLVOID_PROGRAM_ID=Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i
SOLVOID_RELAYER_URL=https://relayer.solvoid.io
```

### Network Configuration

```typescript
import { NetworkConfig } from 'solvoid';

// Predefined network configs
const mainnetConfig = NetworkConfig.MAINNET;
const devnetConfig = NetworkConfig.DEVNET;
const testnetConfig = NetworkConfig.TESTNET;

const client = new SolVoidClient(mainnetConfig, wallet);
```

### Custom Configuration

```typescript
const customConfig: SolVoidConfig = {
  rpcUrl: 'https://my-custom-rpc.com',
  programId: 'MyCustomProgramId',
  relayerUrl: 'https://my-relayer.com',
  commitment: 'confirmed',
  preflightCommitment: 'processed'
};
```

## Privacy Operations

### Privacy Scanning

#### Basic Scan

```typescript
const results = await client.protect(address);

results.forEach(result => {
  console.log(`Transaction: ${result.signature}`);
  console.log(`Privacy Score: ${result.privacyScore}`);
  
  result.leaks.forEach(leak => {
    console.log(`[${leak.severity}] ${leak.description}`);
  });
});
```

#### Advanced Scan with Options

```typescript
const scanOptions: ScanOptions = {
  depth: 200,
  includeHistorical: true,
  analysisTypes: ['leaks', 'links', 'patterns'],
  timeout: 30000
};

const results = await client.protect(address, scanOptions);
```

### Privacy Passport

#### Get Passport

```typescript
const passport = await client.getPassport(address);

console.log(`Overall Score: ${passport.overallScore}/100`);
console.log(`Badges: ${passport.badges.map(b => b.name).join(', ')}`);

// Access metrics
console.log(`Total Deposits: ${passport.metrics.depositCount}`);
console.log(`Total Shielded: ${passport.metrics.totalShielded / 1e9} SOL`);
```

#### Passport Events

```typescript
// Listen for passport updates
client.on('passportUpdated', (passport) => {
  console.log(`Privacy score updated: ${passport.overallScore}/100`);
});

// Listen for badge earned
client.on('badgeEarned', (badge) => {
  console.log(`🎉 New badge: ${badge.icon} ${badge.name}`);
});
```

### Asset Shielding

#### Generate Commitment

```typescript
const shieldResult = await client.shield(1_500_000_000); // 1.5 SOL

console.log('Commitment generated:');
console.log(`Secret: ${shieldResult.commitmentData.secret}`);
console.log(`Nullifier: ${shieldResult.commitmentData.nullifier}`);
console.log(`Commitment: ${shieldResult.commitmentData.commitmentHex}`);

// Save securely
await secureStorage.save('solvoid_secrets', shieldResult.commitmentData);
```

#### Shield with Options

```typescript
const shieldOptions: ShieldOptions = {
  amount: 1_000_000_000,
  delay: 300, // 5 minutes delay
  recipient: customAddress,
  feeTier: 'high',
  encryptedMetadata: 'custom-metadata'
};

const result = await client.shield(shieldOptions);
```

### Anonymous Withdrawal

#### Prepare Withdrawal

```typescript
// Get commitments from relayer
const commitmentsResponse = await fetch(`${config.relayerUrl}/commitments`);
const { commitments } = await commitmentsResponse.json();

// Prepare withdrawal proof
const withdrawalResult = await client.prepareWithdrawal(
  secret,           // From shield operation
  nullifier,        // From shield operation
  recipient,        // Recipient public key
  commitments,      // All commitments from pool
  './withdraw.wasm', // Circuit WASM file
  './withdraw.zkey'  // Circuit proving key
);

console.log(`Proof ready: ${withdrawalResult.proof.length} bytes`);
console.log(`Nullifier Hash: ${withdrawalResult.nullifierHash}`);
```

#### Execute Withdrawal

```typescript
const executeOptions: WithdrawalExecuteOptions = {
  proof: withdrawalResult.proof,
  nullifierHash: withdrawalResult.nullifierHash,
  root: withdrawalResult.root,
  recipient: withdrawalResult.recipient,
  fee: 5_000_000, // 0.005 SOL
  useRelayer: true
};

const txResult = await client.executeWithdrawal(executeOptions);
console.log(`Withdrawal tx: ${txResult.signature}`);
```

### Rescue Operations

#### Analyze Leaks

```typescript
const rescueResult = await client.rescue(address);

if (rescueResult.status === 'analysis_complete') {
  console.log(`Leaks found: ${rescueResult.leakCount}`);
  console.log(`Score improvement: ${rescueResult.potentialScore - rescueResult.currentScore}`);
  
  // Execute rescue if needed
  if (rescueResult.leakCount > 0) {
    const rescueTx = await client.executeRescue(address, {
      maxAmount: 10_000_000_000, // Max 10 SOL
      priorityFee: 1_000_000,
      dryRun: false
    });
    
    console.log(`Rescue tx: ${rescueTx.signature}`);
  }
}
```

## Event Handling

### EventBus

The SDK provides an event bus for real-time updates:

```typescript
import { EventBus } from 'solvoid';

// Listen to all events
EventBus.on('*', (event, data) => {
  console.log(`Event: ${event}`, data);
});

// Listen to specific events
EventBus.on('COMMITMENT_CREATED', (data) => {
  console.log('New commitment created:', data.commitment);
});

EventBus.on('PROOF_GENERATED', (data) => {
  console.log('ZK proof generated:', data.proofType);
});

EventBus.on('WITHDRAWAL_EXECUTED', (data) => {
  console.log('Withdrawal completed:', data.signature);
});
```

### Client Events

```typescript
// Client-specific events
client.on('connected', () => {
  console.log('Connected to SolVoid network');
});

client.on('disconnected', () => {
  console.log('Disconnected from SolVoid network');
});

client.on('error', (error) => {
  console.error('SolVoid error:', error);
});

client.on('transactionUpdate', (update) => {
  console.log(`Transaction ${update.signature}: ${update.status}`);
});
```

### WebSocket Integration

```typescript
// Connect to real-time updates
const wsClient = await client.connectWebSocket();

wsClient.on('newCommitment', (commitment) => {
  console.log('New commitment in pool:', commitment.commitment);
});

wsClient.on('withdrawalExecuted', (withdrawal) => {
  console.log('Anonymous withdrawal:', withdrawal.transactionHash);
});

wsClient.on('privacyAlert', (alert) => {
  if (alert.severity === 'CRITICAL') {
    // Trigger emergency procedures
    handleCriticalAlert(alert);
  }
});
```

## Advanced Usage

### Batch Operations

```typescript
// Batch scan multiple addresses
const addresses = [
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567890ABC123DEF'
];

const batchResults = await Promise.allSettled(
  addresses.map(addr => client.protect(new PublicKey(addr)))
);

const summary = {
  total: addresses.length,
  successful: batchResults.filter(r => r.status === 'fulfilled').length,
  averageScore: calculateAverageScore(batchResults)
};
```

### Custom Privacy Analysis

```typescript
// Custom analysis pipeline
class CustomPrivacyAnalyzer {
  constructor(private client: SolVoidClient) {}
  
  async analyzeWithCustomRules(address: PublicKey): Promise<CustomAnalysis> {
    const basicResults = await client.protect(address);
    
    // Add custom analysis
    const customLeaks = await this.detectCustomPatterns(address);
    const riskScore = this.calculateCustomRisk(customLeaks);
    
    return {
      ...basicResults,
      customLeaks,
      customRiskScore: riskScore,
      recommendations: this.generateRecommendations(customLeaks)
    };
  }
  
  private async detectCustomPatterns(address: PublicKey) {
    // Implement custom pattern detection
    return [];
  }
  
  private calculateCustomRisk(leaks: any[]): number {
    // Implement custom risk calculation
    return 0;
  }
}
```

### Integration with DApps

```typescript
// React Hook for privacy features
function useSolVoidPrivacy(address?: PublicKey) {
  const [passport, setPassport] = useState<PrivacyPassport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { client } = useSolVoid();
  
  const scanPrivacy = useCallback(async () => {
    if (!client || !address) return;
    
    setIsScanning(true);
    try {
      const results = await client.protect(address);
      const passportData = await client.getPassport(address.toBase58());
      setPassport(passportData);
      return results;
    } finally {
      setIsScanning(false);
    }
  }, [client, address]);
  
  const shieldAssets = useCallback(async (amount: number) => {
    if (!client) throw new Error('Client not initialized');
    return await client.shield(amount);
  }, [client]);
  
  return {
    passport,
    isScanning,
    scanPrivacy,
    shieldAssets
  };
}
```

### Error Handling

```typescript
try {
  const result = await client.protect(address);
} catch (error) {
  if (error instanceof SolVoidError) {
    switch (error.code) {
      case SolVoidErrorCode.NETWORK_ERROR:
        console.log('Network error, retrying...');
        await retryOperation(() => client.protect(address));
        break;
        
      case SolVoidErrorCode.INVALID_ADDRESS:
        console.log('Invalid address format');
        break;
        
      case SolVoidErrorCode.INSUFFICIENT_FUNDS:
        console.log('Insufficient funds for operation');
        break;
        
      default:
        console.error('Unknown SolVoid error:', error);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Performance Optimization

```typescript
// Configure for high-performance scenarios
const optimizedClient = new SolVoidClient(config, wallet, {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  debug: false
});

// Use connection pooling for high-throughput
const connectionPool = new ConnectionPool([
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
  'https://solana-api.projectserum.com'
]);

const pooledClient = new SolVoidClient({
  ...config,
  connection: connectionPool.getConnection()
}, wallet);
```

## Type Definitions

### Core Types

```typescript
// Privacy Passport
interface PrivacyPassport {
  readonly address: string;
  readonly overallScore: number;
  readonly badges: PrivacyBadge[];
  readonly metrics: PrivacyMetrics;
  readonly recommendations: PrivacyRecommendation[];
  readonly updatedAt: string;
}

interface PrivacyBadge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly earnedAt: string;
}

interface PrivacyMetrics {
  readonly depositCount: number;
  readonly withdrawalCount: number;
  readonly totalShielded: number;
  readonly averageAnonymitySet: number;
  readonly lastActivity: string;
}

// Scan Results
interface ScanResult {
  readonly signature: string;
  readonly privacyScore: number;
  readonly leaks: PrivacyLeak[];
  readonly timestamp: string;
}

interface PrivacyLeak {
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly type: string;
  readonly description: string;
  readonly transaction?: string;
  readonly recommendation: string;
}

// Shielding
interface ShieldResult {
  readonly status: 'commitment_ready';
  readonly commitmentData: CommitmentData;
  readonly message: string;
}

interface CommitmentData {
  readonly secret: string;
  readonly nullifier: string;
  readonly commitmentHex: string;
  readonly index: number;
}

// Withdrawal
interface WithdrawalResult {
  readonly status: 'proof_ready';
  readonly proof: string;
  readonly nullifierHash: string;
  readonly root: string;
  readonly recipient: string;
  readonly message: string;
}
```

### Error Types

```typescript
enum SolVoidErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_COMMITMENT = 'INVALID_COMMITMENT',
  COMMITMENT_NOT_FOUND = 'COMMITMENT_NOT_FOUND',
  INVALID_PROOF = 'INVALID_PROOF',
  DUPLICATE_NULLIFIER = 'DUPLICATE_NULLIFIER',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

class SolVoidError extends Error {
  constructor(
    public code: SolVoidErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SolVoidError';
  }
}
```

## Examples

### Complete Privacy Flow

```typescript
import { SolVoidClient, SolVoidConfig } from 'solvoid';
import { Keypair, Connection } from '@solana/web3.js';

async function completePrivacyFlow() {
  // Initialize client
  const config: SolVoidConfig = {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    programId: 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i',
    relayerUrl: 'https://relayer.solvoid.io'
  };
  
  const wallet = Keypair.generate();
  const client = new SolVoidClient(config, wallet);
  
  try {
    // 1. Check current privacy status
    const passport = await client.getPassport(wallet.publicKey.toBase58());
    console.log(`Current privacy score: ${passport.overallScore}/100`);
    
    // 2. Scan for privacy leaks
    const scanResults = await client.protect(wallet.publicKey);
    console.log(`Found ${scanResults.reduce((sum, r) => sum + r.leaks.length, 0)} privacy leaks`);
    
    // 3. Shield assets privately
    console.log('Shielding 1.5 SOL...');
    const shieldResult = await client.shield(1_500_000_000);
    
    // Save commitment data securely
    const commitmentData = shieldResult.commitmentData;
    await saveToSecureStorage(commitmentData);
    
    console.log(`Commitment created: ${commitmentData.commitmentHex}`);
    
    // 4. Wait for confirmation (in real app, listen for events)
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // 5. Prepare anonymous withdrawal
    console.log('Preparing withdrawal...');
    const commitments = await fetchCommitments();
    
    const withdrawalResult = await client.prepareWithdrawal(
      commitmentData.secret,
      commitmentData.nullifier,
      wallet.publicKey, // Withdraw back to same address for demo
      commitments,
      './withdraw.wasm',
      './withdraw.zkey'
    );
    
    console.log(`ZK proof generated: ${withdrawalResult.proof.length} bytes`);
    
    // 6. Execute withdrawal
    console.log('Executing withdrawal...');
    const executeResult = await client.executeWithdrawal({
      proof: withdrawalResult.proof,
      nullifierHash: withdrawalResult.nullifierHash,
      root: withdrawalResult.root,
      recipient: wallet.publicKey.toBase58(),
      fee: 5_000_000,
      useRelayer: true
    });
    
    console.log(`Withdrawal complete: ${executeResult.signature}`);
    
    // 7. Check updated privacy status
    const updatedPassport = await client.getPassport(wallet.publicKey.toBase58());
    console.log(`Updated privacy score: ${updatedPassport.overallScore}/100`);
    
  } catch (error) {
    console.error('Privacy flow failed:', error);
    throw error;
  }
}

async function fetchCommitments(): Promise<string[]> {
  const response = await fetch('https://relayer.solvoid.io/commitments');
  const data = await response.json();
  return data.commitments;
}

async function saveToSecureStorage(data: any): Promise<void> {
  // Implement secure storage (encrypted file, keychain, etc.)
  console.log('Saving commitment data securely...');
}

// Execute the flow
completePrivacyFlow().catch(console.error);
```

### React DApp Integration

```tsx
import React, { useState, useEffect } from 'react';
import { SolVoidClient, useSolVoid } from 'solvoid';
import { useWallet } from '@solana/wallet-adapter-react';

interface PrivacyDashboardProps {
  onShieldComplete?: (data: any) => void;
  onWithdrawComplete?: (signature: string) => void;
}

export const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({
  onShieldComplete,
  onWithdrawComplete
}) => {
  const { publicKey, signTransaction } = useWallet();
  const { client, isLoading } = useSolVoid({
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    programId: 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i'
  });
  
  const [passport, setPassport] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isShielding, setIsShielding] = useState(false);
  const [shieldAmount, setShieldAmount] = useState('');
  
  // Load passport on mount
  useEffect(() => {
    if (client && publicKey) {
      client.getPassport(publicKey.toBase58()).then(setPassport);
    }
  }, [client, publicKey]);
  
  // Scan for privacy issues
  const handleScan = async () => {
    if (!client || !publicKey) return;
    
    setIsScanning(true);
    try {
      const results = await client.protect(publicKey);
      setScanResults(results);
      
      // Update passport after scan
      const updatedPassport = await client.getPassport(publicKey.toBase58());
      setPassport(updatedPassport);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };
  
  // Shield assets
  const handleShield = async () => {
    if (!client || !shieldAmount) return;
    
    setIsShielding(true);
    try {
      const amountLamports = parseFloat(shieldAmount) * 1e9;
      const result = await client.shield(amountLamports);
      
      onShieldComplete?.(result.commitmentData);
      
      // Refresh passport
      const updatedPassport = await client.getPassport(publicKey.toBase58());
      setPassport(updatedPassport);
      
      setShieldAmount('');
    } catch (error) {
      console.error('Shielding failed:', error);
    } finally {
      setIsShielding(false);
    }
  };
  
  if (isLoading) {
    return <div className="loading">Loading SolVoid...</div>;
  }
  
  if (!publicKey) {
    return <div className="connect-wallet">Please connect your wallet</div>;
  }
  
  return (
    <div className="privacy-dashboard">
      <div className="passport-section">
        <h2>Privacy Passport</h2>
        {passport && (
          <div className="passport-info">
            <div className="score">
              Score: {passport.overallScore}/100
            </div>
            <div className="badges">
              {passport.badges.map(badge => (
                <span key={badge.id} className="badge" title={badge.description}>
                  {badge.icon} {badge.name}
                </span>
              ))}
            </div>
            <div className="metrics">
              <div>Deposits: {passport.metrics.depositCount}</div>
              <div>Withdrawals: {passport.metrics.withdrawalCount}</div>
              <div>Total Shielded: {(passport.metrics.totalShielded / 1e9).toFixed(2)} SOL</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="scan-section">
        <h3>Privacy Scan</h3>
        <button 
          onClick={handleScan} 
          disabled={isScanning}
          className="scan-button"
        >
          {isScanning ? 'Scanning...' : 'Scan for Privacy Issues'}
        </button>
        
        {scanResults.length > 0 && (
          <div className="scan-results">
            <h4>Scan Results</h4>
            {scanResults.map((result, index) => (
              <div key={index} className="result-item">
                <div>Signature: {result.signature}</div>
                <div>Privacy Score: {result.privacyScore}/100</div>
                {result.leaks.length > 0 && (
                  <div className="leaks">
                    {result.leaks.map((leak, leakIndex) => (
                      <div key={leakIndex} className={`leak ${leak.severity.toLowerCase()}`}>
                        [{leak.severity}] {leak.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="shield-section">
        <h3>Shield Assets</h3>
        <div className="shield-form">
          <input
            type="number"
            placeholder="Amount in SOL"
            value={shieldAmount}
            onChange={(e) => setShieldAmount(e.target.value)}
            step="0.001"
            min="0.001"
          />
          <button 
            onClick={handleShield}
            disabled={isShielding || !shieldAmount}
            className="shield-button"
          >
            {isShielding ? 'Shielding...' : 'Shield Privately'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Node.js Backend Integration

```typescript
import express from 'express';
import { SolVoidClient, SolVoidConfig } from 'solvoid';
import { Keypair } from '@solana/web3.js';

const app = express();
app.use(express.json());

// Initialize SolVoid client
const config: SolVoidConfig = {
  rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  programId: process.env.PROGRAM_ID || 'Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i',
  relayerUrl: process.env.RELAYER_URL || 'https://relayer.solvoid.io'
};

const serverKeypair = Keypair.fromSecretKey(
  Buffer.from(process.env.SERVER_PRIVATE_KEY!, 'base64')
);

const client = new SolVoidClient(config, {
  publicKey: serverKeypair.publicKey,
  signTransaction: async (tx) => {
    tx.partialSign(serverKeypair);
    return tx;
  },
  signAllTransactions: async (txs) => {
    return txs.map(tx => {
      tx.partialSign(serverKeypair);
      return tx;
    });
  }
});

// API Routes
app.get('/api/passport/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const passport = await client.getPassport(address);
    res.json(passport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scan', async (req, res) => {
  try {
    const { address } = req.body;
    const results = await client.protect(new PublicKey(address));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shield', async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await client.shield(amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/withdraw', async (req, res) => {
  try {
    const { secret, nullifier, recipient } = req.body;
    
    // Get commitments
    const commitmentsResponse = await fetch(`${config.relayerUrl}/commitments`);
    const { commitments } = await commitmentsResponse.json();
    
    const result = await client.prepareWithdrawal(
      secret,
      nullifier,
      new PublicKey(recipient),
      commitments,
      './withdraw.wasm',
      './withdraw.zkey'
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SolVoid API server running on port ${PORT}`);
});
```

---

For more advanced integration patterns and real-world examples, visit our [GitHub repository](https://github.com/solvoid/solvoid) and [documentation site](https://docs.solvoid.io).
