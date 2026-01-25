# Shielding Workflow: Active Defense

The primary way to neutralize a privacy leak is to "shield" the compromised assets. This workflow moves assets from a public wallet to the **Shadow Vault**.

## The Surgical Rescue Process

### Step 1: Detect & Select
Use the `SolVoidClient` to identify compromised assets.

```typescript
const leaks = await client.scanner.findLeaks(myWallet);
const targets = leaks.filter(l => l.severity === 'CRITICAL');
```

### Step 2: Initialize Shielding
Initiate a ZK deposit. This generates a **Secret** and a **Nullifier** locally. **NEVER share these.**

```typescript
const { note, instruction } = await client.shield.createDeposit({
    amount: 1.0, // SOL
    mint: 'So11111111111111111111111111111111111111112'
});

// Save your note securely
localStorage.setItem('pz_note_1', note);
```

### Step 3: Commit Transaction
Submit the shielding instruction to the Solana network. Once confirmed, your assets are now part of the global Anonymity Set.

### Step 4: Passive Waiting (Optional but Recommended)
For maximum privacy, wait until several new deposits have occurred (increasing the Anonymity Set) before withdrawing.

### Step 5: Anonymous Withdrawal
To move the assets to a clean, fresh wallet without any on-chain link:

1. Generate a ZK Proof using your note.
2. Send the proof to a **Shadow Relayer**.
3. The Relayer submits the withdrawal and sends the funds to your destination.

```typescript
const proof = await client.shield.generateProof(note, destinationWallet);
const sig = await client.relayer.submitWithdraw(proof);
console.log(`Rescue Operation Complete: ${sig}`);
```

## Best Practices
1. **Never Withdraw to a Doxxed Wallet**: Always use a fresh "burn" address for your rescued assets.
2. **Beware of Timing Attacks**: Don't withdraw the exact same amount immediately after depositing.
3. **Keep Your Notes Safe**: If you lose the note string, your assets are lost forever. SolVoid is non-custodial.
