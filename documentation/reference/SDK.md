# SDK REFERENCE: SOLVOID TYPESCRIPT CORE

[VERSION: 1.0.0] | [TARGET: NODEJS/BROWSER] | [SECURITY: LOCAL_PROVING]

The SolVoid SDK provides a comprehensive interface for integrating privacy-preserving features into Solana-based applications. It handles forensic analysis, Merkle tree management, and ZK-proof generation.

---

## [1] INITIALIZATION

The `SolVoidClient` is the primary entry point for all operations.

```typescript
import { SolVoidClient, SolVoidConfig } from 'solvoid';
import { Connection, Keypair } from '@solana/web3.js';

const config: SolVoidConfig = {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    programId: "Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i",
    relayerUrl: "https://relayer.solvoid.io",
    mock: false
};

// The wallet parameter is used for signing shielding and local proving transactions.
const client = new SolVoidClient(config, userWallet);
```

---

## [2] MODULE: PRIVACY ANALYSIS (SCANNER)

### method: `protect(address: PublicKey)`
Analyzes the transaction history of a given address to identify privacy vulnerabilities.

*   **Parameters**:
    *   `address`: The Solana public key to analyze.
*   **Returns**: `Promise<LeakResult[]>`
*   **Leak Object Schema**:
    ```typescript
    {
        type: "identity" | "metadata" | "state-leak",
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        scope: string,          // e.g., "funding", "ata_link", "payload"
        description: string,    // Human-readable explanation of the leak
        remediation: string     // Suggested action to fix the leak
    }
    ```

### method: `getPassport(address: string)`
Retrieves a consolidated privacy health record for the address.

*   **Returns**: `Promise<Passport>`
    *   `overallScore`: 0-100 privacy health score.
    *   `badges`: Array of status flags (e.g., "MEV_RESILIENT").
    *   `scanHistory`: Timeline of previous scoring events.

---

## [3] MODULE: ACTIVE DEFENSE (SHIELDING)

### method: `shield(amount: number)`
Executes a "Surgical Shielding" operation by depositing assets into the Shadow Vault.

*   **Parameters**:
    *   `amount`: Value in lamports to shield.
*   **Returns**: `Promise<ShieldResult>`
    *   `txid`: Transaction signature on Solana.
    *   `commitmentData`: Object containing `secret` (Buffer) and `nullifier` (Buffer).
*   **[!] CRITICAL**: The `commitmentData` must be stored securely by the user. If lost, the assets cannot be recovered.

### method: `rescue(address: PublicKey)`
An automated macro that performs a scan, identifies leaked assets, and shields them in a single operation.

---

## [4] MODULE: CRYPTOGRAPHIC RECOVERY (WITHDRAWAL)

### method: `withdraw(params: WithdrawParams)`
Performs an unlinkable withdrawal from the Shadow Vault using a ZK-SNARK membership proof.

*   **WithdrawParams**:
    ```typescript
    {
        secretHex: string,       // Hex-encoded secret from shielding
        nullifierHex: string,    // Hex-encoded nullifier from shielding
        recipient: PublicKey,    // Fresh recipient address
        allCommitments: Buffer[],// List of all known commitments in history
        wasmPath: string,        // Local path to circuit WASM
        zkeyPath: string,        // Local path to circuit ZKEY
        relayerSigner: any,      // Signer for the transaction fee
        fee: number              // Bounty for the relayer (in lamports)
    }
    ```
*   **Process Flow**:
    1.  Calculates Merkle Path locally based on `allCommitments`.
    2.  Generates ZK-Proof (Groth16) using `wasm` and `zkey`.
    3.  Signs and submits a `withdraw` instruction to the SolVoid Program.

---

## [5] ERROR CODES & EXCEPTIONS

| Error Code | Description | Mitigation |
| :--- | :--- | :--- |
| `ERR_INVALID_ROOT` | The Merkle root in the proof is not recognized by the on-chain program. | Sync the relayer and fetch the latest Merkle state. |
| `ERR_NULLIFIER_SPENT` | The assets associated with this secret have already been withdrawn. | Check previous transactions for this nullifier. |
| `ERR_INVALID_PROOF` | The ZK-Proof verification failed. | Ensure the local `wasm` and `zkey` match the on-chain program. |
| `ERR_INSUFFICIENT_FEE` | The relayer fee is below the network requirement. | Increase the `fee` parameter. |

---
[DOCS_STATUS: COMPLETE] | [SDK_STABILITY: PRODUCTION]
