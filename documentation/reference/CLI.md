# CLI Reference: solvoid-scan

The `solvoid-scan` utility is a high-performance terminal tool for on-chain identity forensics, asset shielding, and privacy recovery.

## Usage

```bash
npx solvoid-scan <command> [arguments] [flags]
```

## Commands

| Command | Description | Arguments |
| --- | --- | --- |
| `protect` | Scan a Solana address for privacy leaks and view its Privacy Passport. | `<address>` |
| `rescue` | Execute an atomic shielding operation for all leaked assets associated with an address. | `<address>` |
| `shield` | Manually execute a private deposit (Surgical Shielding) into the Shadow Vault. | `<amount>` |
| `withdraw` | Perform an unlinkable ZK-SNARK withdrawal to a fresh recipient address. | `<secret> <nullifier> <recipient>` |

## Global Flags

| Flag | Description | Default |
| --- | --- | --- |
| `--rpc <url>` | Custom Solana RPC endpoint. | `https://api.mainnet-beta.solana.com` |
| `--relayer <url>` | Custom Relayer/Shadow RPC URL for ZK proof submission. | `http://localhost:3000` |
| `--program <id>` | Override the default SolVoid program ID. | `Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i` |
| `--surgical` | Optimize shielding logic to focus only on identified leaked assets. | `false` |
| `--shadow-rpc` | Broadcast transactions via encrypted relay hops for maximum anonymity. | `false` |
| `--mock` | Enable simulated mode for testing without real network interaction. | `false` |
| `--help` | Display the help menu with all available commands and flags. | N/A |

## Examples

### 1. Auditing an Address
Scan an address to identify privacy risks and view its Privacy Passport score:
```bash
npx solvoid-scan protect 7xKX...address...
```

### 2. Atomic Asset Rescue
Automatically shield all leaked assets from a compromised or public address:
```bash
npx solvoid-scan rescue 7xKX...address... --shadow-rpc
```

### 3. Surgical Shielding
Deposit 5 SOL into the Shadow Vault and receive a cryptographic note (secret/nullifier):
```bash
npx solvoid-scan shield 5
```

### 4. Anonymous ZK Withdrawal
Withdraw assets to a fresh address using the secrets generated during shielding:
```bash
npx solvoid-scan withdraw <secret> <nullifier> <recipient_address> --relayer https://my-relayer.com
```

## Advanced Configuration

### Environment Variables
The CLI respects the following environment variables if flags are not provided:

| Variable | Flag Equivalent | Description |
| --- | --- | --- |
| `RPC_URL` | `--rpc` | The Solana RPC endpoint. |
| `PROGRAM_ID` | `--program` | The SolVoid on-chain program ID. |
| `SHADOW_RELAYER_URL`| `--relayer` | The URL of the ZK relayer service. |
| `ZK_WASM_PATH` | N/A | Local path to the ZK circuit WASM file. |
| `ZK_ZKEY_PATH` | N/A | Local path to the ZK proving key (.zkey). |

### Exit Codes
- `0`: Operation completed successfully.
- `1`: Operation failed (e.g., critical leaks found, ZK proof generation error, or invalid input).
- `130`: Process interrupted (Ctrl+C).
