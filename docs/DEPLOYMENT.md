# SolVoid Deployment & Integration Guide

This comprehensive guide covers deployment strategies, integration patterns, and operational procedures for the SolVoid privacy platform.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Environment Setup](#environment-setup)
- [Program Deployment](#program-deployment)
- [Infrastructure Deployment](#infrastructure-deployment)
- [Application Deployment](#application-deployment)
- [Integration Guides](#integration-guides)
- [Monitoring & Operations](#monitoring--operations)

## Deployment Overview

SolVoid supports multiple deployment strategies for different environments:

### Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev_Local[Local Development]
        Dev_Docker[Docker Compose]
        Dev_Testnet[Testnet Deployment]
    end
    
    subgraph "Production"
        Prod_Mainnet[Mainnet Deployment]
        Prod_MultiRegion[Multi-Region Setup]
        Prod_HADR[High Availability]
    end
    
    subgraph "Components"
        Solana_Program[Solana Program]
        Relayer_Network[Relayer Network]
        API_Services[API Services]
        Dashboard[Web Dashboard]
    end
    
    Dev_Local --> Solana_Program
    Dev_Docker --> API_Services
    Prod_Mainnet --> Relayer_Network
    Prod_HADR --> Dashboard
```

## Environment Setup

### Prerequisites

**System Requirements:**
- CPU: 8+ cores (16+ for production)
- Memory: 32GB+ RAM (64GB+ for production)
- Storage: 500GB+ SSD (1TB+ for production)
- Network: 1Gbps+ connection
- OS: Ubuntu 20.04+ or CentOS 8+

**Software Dependencies:**
```bash
# Core dependencies
curl -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Environment Configuration

**Development (.env.dev)**:
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLVOID_PROGRAM_ID=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
DATABASE_URL=postgresql://user:password@localhost:5432/solvoid_dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
```

**Production (.env.prod)**:
```bash
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLVOID_PROGRAM_ID=Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i
DATABASE_URL=postgresql://solvoid:secure_password@db:5432/solvoid_prod
REDIS_URL=redis://redis-cluster:6379
LOG_LEVEL=info
API_RATE_LIMIT=10000
```

## Program Deployment

### Build Process

```bash
# Build Solana program
cd program
cargo build-bpf --manifest-path=Cargo.toml --bpf-out-dir=target/deploy

# Run tests
cargo test-bpf

# Security audit
cargo audit
```

### Deployment Scripts

**Devnet Deployment**:
```bash
#!/bin/bash
# deploy-devnet.sh

set -e
PROGRAM_KEYPAIR="$HOME/.config/solana/id.json"
PROGRAM_SO="target/deploy/solvoid.so"

echo "Deploying to devnet..."
solana config set --url https://api.devnet.solana.com

# Deploy program
PROGRAM_ID=$(solana program deploy $PROGRAM_SO --program-id $PROGRAM_KEYPAIR | grep "Program Id" | awk '{print $3}')
echo "Program deployed with ID: $PROGRAM_ID"

# Update environment
sed -i "s/SOLVOID_PROGRAM_ID=.*/SOLVOID_PROGRAM_ID=$PROGRAM_ID/" .env.dev
echo "Devnet deployment complete!"
```

**Mainnet Deployment**:
```bash
#!/bin/bash
# deploy-mainnet.sh

set -e
PROGRAM_KEYPAIR="/etc/solvoid/program-keypair.json"
PROGRAM_SO="target/deploy/solvoid.so"

echo "Deploying to mainnet..."
solana config set --url https://api.mainnet-beta.solana.com

# Check balance (minimum 5 SOL required)
BALANCE_LAMPORTS=$(solana balance | awk '{print $1}')
MIN_BALANCE=5000000000

if [ "$BALANCE_LAMPORTS" -lt "$MIN_BALANCE" ]; then
    echo "Error: Insufficient balance. Minimum 5 SOL required."
    exit 1
fi

# Deploy with confirmation
echo "Ready to deploy to mainnet."
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

PROGRAM_ID=$(solana program deploy $PROGRAM_SO --program-id $PROGRAM_KEYPAIR | grep "Program Id" | awk '{print $3}')
echo "Program deployed with ID: $PROGRAM_ID"

# Update production environment
sed -i "s/SOLVOID_PROGRAM_ID=.*/SOLVOID_PROGRAM_ID=$PROGRAM_ID/" .env.prod
echo "Mainnet deployment complete!"
```

## Infrastructure Deployment

### Docker Deployment

**Dockerfile for API**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S solvoid -u 1001
WORKDIR /app
COPY --from=builder --chown=solvoid:nodejs /app/dist ./dist
COPY --from=builder --chown=solvoid:nodejs /app/node_modules ./node_modules
USER solvoid
EXPOSE 8000
CMD ["node", "dist/index.js"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  solvoid-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/solvoid
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  solvoid-relayer:
    build: ./relayer
    ports:
      - "3000:3000"
    environment:
      - SOLANA_RPC_URL=https://api.devnet.solana.com

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: solvoid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

**API Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solvoid-api
  namespace: solvoid
spec:
  replicas: 3
  selector:
    matchLabels:
      app: solvoid-api
  template:
    metadata:
      labels:
        app: solvoid-api
    spec:
      containers:
      - name: api
        image: solvoid/api:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: solvoid-config
        - secretRef:
            name: solvoid-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**Service Configuration**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: solvoid-api-service
  namespace: solvoid
spec:
  selector:
    app: solvoid-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

## Application Deployment

### Dashboard Deployment

**Build Script**:
```bash
#!/bin/bash
cd dashboard
npm ci --production=false
npm run build
tar -czf ../dist/dashboard.tar.gz .next public package.json
echo "Dashboard build complete!"
```

**Nginx Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name solvoid.io;

    ssl_certificate /etc/ssl/certs/solvoid.crt;
    ssl_certificate_key /etc/ssl/private/solvoid.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Strict-Transport-Security "max-age=31536000";

    # Static files
    location /_next/static {
        alias /var/www/solvoid/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

## Integration Guides

### React DApp Integration

```typescript
import React, { useState, useEffect } from 'react';
import { SolVoidClient, useSolVoid } from 'solvoid';
import { useWallet } from '@solana/wallet-adapter-react';

export const SolVoidIntegration: React.FC = () => {
  const { publicKey } = useWallet();
  const { client, isLoading } = useSolVoid({
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
    programId: process.env.NEXT_PUBLIC_SOLVOID_PROGRAM_ID!
  });

  const [privacyScore, setPrivacyScore] = useState(0);
  const [isShielding, setIsShielding] = useState(false);

  useEffect(() => {
    if (client && publicKey) {
      updatePrivacyScore();
    }
  }, [client, publicKey]);

  const updatePrivacyScore = async () => {
    if (!client || !publicKey) return;
    
    try {
      const passport = await client.getPassport(publicKey.toBase58());
      setPrivacyScore(passport.overallScore);
    } catch (error) {
      console.error('Failed to get privacy score:', error);
    }
  };

  const handleShield = async (amount: number) => {
    if (!client || !publicKey) return;

    setIsShielding(true);
    try {
      const result = await client.shield(amount * 1e9);
      console.log('Shielding complete:', result.commitmentData.commitmentHex);
      await updatePrivacyScore();
    } catch (error) {
      console.error('Shielding failed:', error);
    } finally {
      setIsShielding(false);
    }
  };

  if (isLoading) return <div>Loading SolVoid...</div>;

  return (
    <div className="solvoid-integration">
      <h3>Privacy Score: {privacyScore}/100</h3>
      <button 
        onClick={() => handleShield(1.0)}
        disabled={isShielding}
      >
        {isShielding ? 'Shielding...' : 'Shield 1 SOL'}
      </button>
    </div>
  );
};
```

### Backend Integration

```typescript
import { SolVoidClient } from 'solvoid';
import { Keypair } from '@solana/web3.js';

class SolVoidService {
  private client: SolVoidClient;

  constructor() {
    this.serverKeypair = Keypair.fromSecretKey(
      Buffer.from(process.env.SERVER_PRIVATE_KEY!, 'base64')
    );

    this.client = new SolVoidClient({
      rpcUrl: process.env.SOLANA_RPC_URL!,
      programId: process.env.SOLVOID_PROGRAM_ID!
    }, {
      publicKey: this.serverKeypair.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(this.serverKeypair);
        return tx;
      }
    });
  }

  async analyzePrivacy(address: string): Promise<PrivacyAnalysis> {
    const passport = await this.client.getPassport(address);
    const results = await this.client.protect(new PublicKey(address));

    return {
      address,
      overallScore: passport.overallScore,
      leaks: results.flatMap(r => r.leaks),
      metrics: passport.metrics
    };
  }

  async createShieldingOperation(amount: number): Promise<ShieldingResult> {
    return await this.client.shield(amount);
  }
}

export const solvoidService = new SolVoidService();
```

### Webhook Integration

```typescript
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

router.post('/privacy-alert', async (req, res) => {
  const signature = req.headers['x-solvoid-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, data } = req.body;

  try {
    switch (event) {
      case 'privacy_alert':
        await handlePrivacyAlert(data);
        break;
      case 'deposit_complete':
        await handleDepositComplete(data);
        break;
    }

    res.json({ status: 'received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

async function handlePrivacyAlert(alert: any) {
  console.log('Privacy alert:', alert);
  if (alert.severity === 'CRITICAL') {
    await sendCriticalAlert(alert);
  }
}
```

## Monitoring & Operations

### Health Checks

```typescript
import express from 'express';

class HealthChecker {
  constructor(private client: SolVoidClient) {}

  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkSolanaConnection(),
      this.checkRelayerConnection()
    ]);

    const status = checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded';
    const details = checks.map((check, index) => ({
      name: ['database', 'solana', 'relayer'][index],
      status: check.status === 'fulfilled' ? 'ok' : 'error'
    }));

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: details
    };
  }

  private async checkSolanaConnection(): Promise<string> {
    const slot = await this.client.connection.getSlot();
    return `Solana RPC OK - Slot: ${slot}`;
  }

  private async checkRelayerConnection(): Promise<string> {
    const response = await fetch(`${this.client.config.relayerUrl}/health`);
    return response.ok ? 'Relayer OK' : 'Relayer error';
  }
}

export function createHealthRouter(client: SolVoidClient): express.Router {
  const router = express.Router();
  const healthChecker = new HealthChecker(client);

  router.get('/health', async (req, res) => {
    const health = await healthChecker.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  });

  return router;
}
```

### Backup Procedures

**Database Backup**:
```bash
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
DATABASE_URL=$1

mkdir -p "$BACKUP_DIR"
pg_dump $DATABASE_URL > "$BACKUP_DIR/solvoid_$(date +%H%M%S).sql"
gzip "$BACKUP_DIR"/*.sql

# Remove old backups (keep last 7 days)
find /backup -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR"
```

**Program State Backup**:
```bash
#!/bin/bash
PROGRAM_ID=$1
BACKUP_DIR="/backup/program/$(date +%Y%m%d)"

mkdir -p "$BACKUP_DIR"

# Export program accounts
solana account $PROGRAM_ID --output json > "$BACKUP_DIR/program_account.json"
solana program show $PROGRAM_ID --output json > "$BACKUP_DIR/program_info.json"

echo "Program state backup completed: $BACKUP_DIR"
```

### Update Procedures

**Rolling Update**:
```bash
#!/bin/bash
NEW_IMAGE=$1
SERVICE_NAME=$2

echo "Starting rolling update for $SERVICE_NAME..."

# Update deployment
kubectl set image deployment/$SERVICE_NAME solvoid=$NEW_IMAGE

# Wait for rollout
kubectl rollout status deployment/$SERVICE_NAME --timeout=300s

echo "Rolling update completed!"
```

### Security Maintenance

**Security Scan**:
```bash
#!/bin/bash
echo "Running security scans..."

# Dependency vulnerability scan
npm audit --audit-level moderate
cargo audit

# Container security scan
docker run --rm aquasec/trivy image solvoid/api:latest

echo "Security scan completed!"
```

---

This deployment guide provides comprehensive procedures for deploying and maintaining the SolVoid privacy platform across different environments. For specific technical details, refer to the individual component documentation.
