# CLI COMMAND REFERENCE: SOLVOID-SCAN

[BINARY: solvoid-scan] | [VERSION: 1.2.4] | [PLATFORM: NODEJS]

The `solvoid-scan` utility is a high-performance terminal interface for privacy forensics and cryptographic shielding on the Solana blockchain.

---

## [1] COMMAND STRUCTURE

```bash
npx solvoid-scan <COMMAND> [ARGUMENTS] [FLAGS]
```

### [1.1] PROTECT
Executes a forensic audit of a target wallet address.

*   **Syntax**: `npx solvoid-scan protect <ADDRESS>`
*   **Logic**:
    1.  Fetches the last 1000 transactions for the address.
    2.  Runs the `PrivacyEngine` analysis loop.
    3.  Scores identity linkage, metadata hygiene, and state exposure.
    4.  Outputs a "Privacy Passport" with color-coded severity markers.

---

### [1.2] RESCUE
Performs an automated identification and shielding of compromised assets.

*   **Syntax**: `npx solvoid-scan rescue <ADDRESS>`
*   **Workflow**:
    *   **Audit Phase**: Scans the address for leaks.
    *   **Selection Phase**: Identifies SOL and SPL balances with direct leakage history.
    *   **Action Phase**: Generates commitment notes and deposits assets into the Shadow Vault.
*   **Flags**:
    *   `--surgical`: Only shield assets specifically linked to a detected leak.

---

### [1.3] SHIELD
Manually deposits assets (SOL) into the Shadow Vault to break on-chain history.

*   **Syntax**: `npx solvoid-scan shield <AMOUNT_IN_SOL>`
*   **Output**: 
    *   **Secret**: 256-bit entropy (hex).
    *   **Nullifier**: 256-bit entropy (hex).
*   **Important**: These values are printed only once. Users must back them up to a secure, offline location.

---

### [1.4] WITHDRAW
Executes a ZK-SNARK withdrawal to a fresh recipient.

*   **Syntax**: `npx solvoid-scan withdraw <SECRET> <NULLIFIER> <RECIPIENT_ADDRESS>`
*   **Background**: 
    *   The CLI generates a membership proof for the Shadow Vault commitment pool.
    *   It communicates with the configured Relayer to broadcast the transaction.

---

## [2] GLOBAL FLAGS & CONFIGURATION

| Flag | Argument | Description | Default |
| :--- | :--- | :--- | :--- |
| `--rpc` | `<URL>` | Custom Solana RPC endpoint. | Mainnet Beta |
| `--relayer`| `<URL>` | Custom Relayer API endpoint. | http://localhost:3000 |
| `--program`| `<PUBKEY>`| Override the SolVoid Program ID. | [PriZero...5i] |
| `--shadow` | `N/A` | Enables multi-hop relaying for broadcast. | FALSE |
| `--mock` | `N/A` | Runs in simulated mode (no SOL spent). | FALSE |

---

## [3] EXIT CODES

| Code | Status | Meaning |
| :--- | :--- | :--- |
| `0` | SUCCESS | Operation completed successfully. |
| `1` | ERROR | General failure (see logs). |
| `2` | LEAK_DETECTED | Scan completed; critical privacy leaks found. |
| `401` | AUTH_FAIL | Relayer rejected request due to insufficient fee. |

---

## [4] ENVIRONMENT VARIABLES

The CLI will automatically ingest the following variables from a `.env` file in the root directory:

*   `SOLANA_RPC_URL`: Global RPC node.
*   `SOLVOID_PROGRAM_ID`: The deployed program address.
*   `ZK_WASM_PATH`: Path to the compiled circuit WASM.
*   `ZK_ZKEY_PATH`: Path to the proving key file.

---
[CLI_STATUS: STABLE] | [FORENSICS_ENGINE: V2]
