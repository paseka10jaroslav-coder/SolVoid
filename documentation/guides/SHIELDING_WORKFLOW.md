# Shielding Workflow: Active Defense

The primary way to neutralize a privacy leak is to "shield" the compromised assets. This workflow moves assets from a public wallet to the **Shadow Vault**.

## The Surgical Rescue Process

### Step 1: Detect & Select
Identify compromised assets using the CLI or SDK.

**CLI:**
```bash
npx solvoid-scan protect <YOUR_ADDRESS>
```

**SDK:**
```typescript
const leaks = await client.protect(myWallet);
const targets = leaks.filter(l => l.severity === 'CRITICAL');
```

### Step 2: Initialize Shielding
Initiate a ZK deposit. This generates a **Secret** and a **Nullifier** locally. **NEVER share these.**

**CLI:**
```bash
npx solvoid-scan shield 1.0
```

**SDK:**
```typescript
const { commitmentData, txid } = await client.shield(1.0);
console.log('Secret:', commitmentData.secret.toString('hex'));
console.log('Nullifier:', commitmentData.nullifier.toString('hex'));
```

### Step 3: Commit Transaction
Submit the shielding instruction to the Solana network. Once confirmed, your assets are now part of the global Anonymity Set.

### Step 4: Passive Waiting (Optional but Recommended)
For maximum privacy, wait until several new deposits have occurred (increasing the Anonymity Set) before withdrawing.

### Step 5: Anonymous Withdrawal
To move the assets to a clean, fresh wallet without any on-chain link:

1. Generate a ZK Proof using your secret and nullifier.
2. Send the proof to a **Shadow Relayer**.
3. The Relayer submits the withdrawal and sends the funds to your destination.

**CLI:**
```bash
npx solvoid-scan withdraw <secret> <nullifier> <destination_address>
```

**SDK:**
```typescript
const sig = await client.withdraw(secret, nullifier, destination, commitments, wasm, zkey, wallet);
console.log(`Rescue Operation Complete: ${sig}`);
```

## Best Practices
1. **Never Withdraw to a Doxxed Wallet**: Always use a fresh "burn" address for your rescued assets.
2. **Beware of Timing Attacks**: Don't withdraw the exact same amount immediately after depositing.
3. **Keep Your Notes Safe**: If you lose the note string, your assets are lost forever. SolVoid is non-custodial.
