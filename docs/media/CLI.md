# CLI Reference: privacy-scan

The `privacy-scan` utility is a high-performance terminal tool for on-chain identity forensics.

## Usage

```bash
npx privacy-scan <SIGNATURE> [options]
```

## Global Options

| Flag | Description | Default |
| --- | --- | --- |
| `--rpc <url>` | Custom Solana RPC endpoint. | Mainnet Beta |
| `--profile <name>` | Preset analysis profile (see below). | `standard` |
| `--enterprise` | Enable deep binary state scanning and compliance. | `false` |
| `--json` | Output result as raw JSON for machine reading. | `false` |
| `--verbose` | Show detailed trace of instruction decoding. | `false` |

## Analysis Profiles

- **`standard`**: Balanced scan of instruction data and account owners.
- **`mev-protection`**: High-weight analysis of mempool exposure and Jito bundle inclusion.
- **`regulatory`**: Focus on links to sanctioned addresses or high-risk "mixing" protocols.
- **`counterparty`**: Identifies links to known counterparty wallets in OTC or DEX trades.

## Examples

### Deep Forensics of a Bridge Transaction
```bash
npx privacy-scan 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc... --enterprise --verbose
```

### CI/CD Compliance Check
```bash
# Returns non-zero exit code if privacy score < 80
npx privacy-scan 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc... --min-score 80
```

## Exit Codes
- `0`: Scan passed or risks accepted via manifest.
- `1`: Critical privacy leaks detected.
- `2`: Network or RPC error.
