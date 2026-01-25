# Security Documentation

## Overview

SolVoid is a **leak detection scanner**, not a privacy solution. This document explains:
1. What privacy guarantees the tool provides (none - it's a scanner)
2. What privacy guarantees the integrated protocols provide
3. Known limitations and attack vectors
4. Proper usage for actual privacy

## SolVoid Does NOT Provide Privacy

**This is critical to understand.**

SolVoid scans transactions to identify privacy leaks. It does not:
- Encrypt any data
- Hide any information on-chain
- Provide anonymity
- Protect against chain analysis

All Solana transactions are public and permanent. This tool helps you understand what you're exposing.

## Integrated Protocol Privacy Guarantees

### Token-2022 Confidential Transfers

**What it hides:**
- ✅ Token balances (after deposit to encrypted state)
- ✅ Transfer amounts between confidential accounts

**What it exposes:**
- ❌ Sender address (fully visible)
- ❌ Receiver address (fully visible)
- ❌ Transaction timing (block timestamp)
- ❌ Deposit/withdrawal amounts (at boundaries)
- ❌ Token mint being used
- ❌ Fee payer

**Threat Model:**
Token-2022 CT protects against casual observers seeing your balance and transfer amounts. It does NOT protect against:
- Identity correlation (addresses are visible)
- Timing analysis
- Amount inference from deposit/withdraw patterns

### Light Protocol (ZK State Compression)

**What it hides:**
- ✅ Sender identity (within anonymity set)
- ✅ Receiver identity (within anonymity set)
- ✅ Transfer amounts

**What it exposes:**
- ❌ That a transaction occurred
- ❌ Approximate timing
- ❌ Programs being interacted with
- ❌ Network-level metadata (IP, RPC queries)

**Threat Model:**
Light Protocol provides cryptographic privacy through ZK proofs. Privacy strength depends on:
- Size of anonymity set
- Time between shield/unshield
- Behavioral patterns

### Jito (MEV Protection)

**What it protects against:**
- ✅ Front-running
- ✅ Sandwich attacks
- ✅ Public mempool visibility

**What it does NOT protect:**
- ❌ On-chain transaction data (still visible after inclusion)
- ❌ Block explorer analysis
- ❌ Historical transaction tracing

## Removed Features

### Obfuscator / SafeObfuscator

These features were **removed** because they provided **no privacy** while creating a **false sense of security**.

**Why they were broken:**

1. **Funding Trace Attack**
   - User creates "SessionKey" (ephemeral keypair)
   - User sends SOL to SessionKey to pay for fees
   - This transfer is on-chain: `MainWallet → SessionKey`
   - Any analyst can trace this in seconds
   - Result: Zero privacy

2. **No Cryptographic Privacy**
   - Just key substitution, not encryption
   - All transaction data fully visible
   - No ZK proofs, no mixers, no privacy

3. **Worse Than Nothing**
   - Unusual patterns (unfunded ephemeral signers) draw attention
   - Creates false confidence in users
   - Users take more risks thinking they're protected

**What to use instead:**

| Use Case | Solution |
|----------|----------|
| Hide transaction from mempool | Jito private RPC |
| Hide transfer amounts | Token-2022 Confidential Transfers |
| Hide sender/receiver | Light Protocol |
| All of the above | Light Protocol + Jito |

## Attack Vectors

### Script Kiddie (Solscan User)
- **Tools**: Block explorer, basic clustering
- **Time to deanonymize**: 2-5 minutes
- **What breaks privacy**: Direct wallet address in transaction

### Professional Chain Analyst (Chainalysis)
- **Tools**: Graph database, ML clustering, timing analysis
- **Time to deanonymize**: 30 seconds (automated)
- **What breaks privacy**: 
  - Funding traces
  - Account reuse
  - Timing patterns
  - Amount patterns

### MEV Bot Operator
- **Tools**: Mempool monitoring, transaction simulation
- **Time to exploit**: Real-time
- **What breaks privacy**: Public mempool submission

### Hostile RPC Provider
- **Tools**: Request logging, IP correlation
- **Time to deanonymize**: Real-time
- **What breaks privacy**: Using their endpoint without VPN/Tor

## Best Practices

### For Casual Privacy
1. Use a fresh wallet for each major activity
2. Don't reuse addresses across contexts
3. Wait random intervals between transactions
4. Use Jito for any DEX activity

### For Serious Privacy
1. Use Light Protocol for all value transfers
2. Fund new wallets through privacy-preserving channels
3. Use your own RPC node or trusted private RPC
4. Connect through Tor or VPN
5. Don't create timing patterns

### For Regulatory Compliance
1. Document all privacy-impacting decisions
2. Use privacy-manifest.json waivers
3. Regular privacy audits with this scanner
4. Staff training on privacy implications

## Reporting Security Issues

If you find a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@privacyzero.dev
3. Include: Description, reproduction steps, impact assessment
4. We will respond within 48 hours

## Audit Status

This codebase has NOT been audited by a third-party security firm.

It is provided as-is for educational and development purposes. Do not rely on it for production security without additional review.

---

**Remember**: Privacy is not a product feature you can bolt on. It requires careful architecture from the start.
