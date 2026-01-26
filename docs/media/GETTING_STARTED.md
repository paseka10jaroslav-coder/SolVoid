# Getting Started with SolVoid

Setup your tactical privacy terminal in minutes.

## Prerequisites
- Node.js >= 16.0.0
- A private Solana RPC endpoint (recommended: Helius, Alchemy, or Triton)

## 1. Installation

```bash
npm install solvoid
```

## 2. Basic Configuration
Create a `.env` file in your project root:

```env
RPC_URL=https://your-private-rpc.com
SHADOW_RELAYER_URL=https://relayer.solvoid.io
```

## 3. Your First Privacy Scan
The CLI tool `solvoid-scan` is the fastest way to audit a wallet address.

```bash
# Scan a specific address
npx solvoid-scan protect 7xKX...address...

# Result:
# [!] IDENTITY LEAK DETECTED (High Severity)
# Address links your main wallet to a known CEX deposit address via funding.
# Privacy Score: 42/100
```

## 4. Understanding the Score
SolVoid uses a 5-point radar system to evaluate your health:

| Metric | Description |
| --- | --- |
| **Identity Linkage** | Direct connection to your real-world identity (KYC/Doxxed wallets). |
| **Metadata Hygiene** | Leaks via memo fields, logs, or unencrypted metadata. |
| **MEV Resilience** | Resistance to predatory bots in the public mempool. |
| **State Exposure** | Permanent footprint in third-party program accounts. |
| **Anonymity Set** | The mathematical "crowd" your assets are currently hidden in. |

## 5. Next Steps
Once you've identified a leak, proceed to the [Shielding Workflow](./SHIELDING_WORKFLOW.md) to neutralize the threat.
