# SolVoid CLI Documentation

The SolVoid Command Line Interface (CLI) provides comprehensive access to privacy features directly from your terminal. This document covers all commands, flags, and usage patterns.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Global Flags](#global-flags)
- [Commands](#commands)
- [Configuration](#configuration)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Installation

### Global Installation

```bash
# Install globally via npm
npm install -g solvoid

# Verify installation
solvoid-scan --version
```

### Local Installation

```bash
# Install in project
npm install solvoid

# Run via npx
npx solvoid-scan protect <address>

# Or add to package.json scripts
{
  "scripts": {
    "privacy-scan": "solvoid-scan"
  }
}
```

### Build from Source

```bash
# Clone repository
git clone https://github.com/solvoid/solvoid.git
cd solvoid

# Install dependencies
npm install

# Build CLI
npm run build

# Link globally
npm link
```

## Quick Start

```bash
# Basic privacy scan
solvoid-scan protect 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Shield 1 SOL privately
solvoid-scan shield 1.0

# Get help
solvoid-scan --help
```

## Global Flags

These flags can be used with any command:

| Flag | Short | Description | Default | Example |
|------|-------|-------------|---------|---------|
| `--rpc` | `-r` | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` | `--rpc https://rpc.ankr.com/solana` |
| `--program` | `-p` | Program ID | `Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i` | `--program 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM` |
| `--relayer` | `-R` | Relayer service URL | `http://localhost:3000` | `--relayer https://relayer.solvoid.io` |
| `--keypair` | `-k` | Wallet keypair file | `~/.config/solana/id.json` | `--keypair ./my-wallet.json` |
| `--output` | `-o` | Output format (json, table, csv) | `table` | `--output json` |
| `--quiet` | `-q` | Suppress non-error output | `false` | `--quiet` |
| `--verbose` | `-v` | Verbose logging | `false` | `--verbose` |
| `--help` | `-h` | Show help message | - | `--help` |
| `--version` | `-V` | Show version | - | `--version` |

### Environment Variables

You can set defaults using environment variables:

```bash
# Set default RPC
export SOLVOID_RPC_URL="https://rpc.ankr.com/solana"

# Set default program ID
export SOLVOID_PROGRAM_ID="Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i"

# Set default relayer
export SOLVOID_RELAYER_URL="https://relayer.solvoid.io"

# Set default keypair
export SOLVOID_KEYPAIR="$HOME/.config/solana/id.json"
```

## Commands

### `protect`

Scan an address for privacy leaks and generate a Privacy Passport.

#### Syntax

```bash
solvoid-scan protect <address> [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `address` | Solana public key to scan | Yes |

#### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--depth` | Number of transactions to analyze | `100` |
| `--include-historical` | Include historical analysis | `true` |
| `--check-patterns` | Enable pattern detection | `true` |
| `--save-report` | Save report to file | `false` |
| `--report-format` | Report format (json, html, pdf) | `json` |

#### Examples

```bash
# Basic scan
solvoid-scan protect 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Deep scan with custom depth
solvoid-scan protect 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --depth 500

# Save HTML report
solvoid-scan protect 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --save-report --report-format html

# JSON output for automation
solvoid-scan protect 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --output json
```

#### Output

**Table Format:**
```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRIVACY SCAN RESULTS                        │
├─────────────────────────────────────────────────────────────────────┤
│ Address:     9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM            │
│ Score:       78/100                                                 │
│ Status:      ⚠️  MODERATE RISK                                      │
├─────────────────────────────────────────────────────────────────────┤
│ PRIVACY PASSPORT                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Overall Score:    78/100                                           │
│ Badges:           🛡️ Privacy Guardian, 🔒 Shield Master            │
│ Deposits:         12                                               │
│ Withdrawals:      8                                                │
│ Total Shielded:   15.5 SOL                                         │
├─────────────────────────────────────────────────────────────────────┤
│ PRIVACY LEAKS DETECTED                                             │
├─────────────────────────────────────────────────────────────────────┤
│ [HIGH] Direct link to CEX deposit address                          │
│        Transaction: 5j7s83...                                      │
│        Recommendation: Use shielded deposits                       │
│                                                                     │
│ [MEDIUM] Regular withdrawal pattern detected                        │
│        Frequency: Weekly                                           │
│        Recommendation: Randomize timing                            │
└─────────────────────────────────────────────────────────────────────┘
```

**JSON Format:**
```json
{
  "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "scanId": "scan_123456789",
  "timestamp": "2024-01-20T15:30:00Z",
  "passport": {
    "overallScore": 78,
    "badges": [
      {
        "id": "privacy_guardian",
        "name": "Privacy Guardian",
        "icon": "🛡️"
      }
    ],
    "metrics": {
      "depositCount": 12,
      "withdrawalCount": 8,
      "totalShielded": 15500000000
    }
  },
  "leaks": [
    {
      "severity": "HIGH",
      "type": "cex_link",
      "description": "Direct link to CEX deposit address",
      "transaction": "5j7s83...",
      "recommendation": "Use shielded deposits"
    }
  ],
  "privacyScore": 78
}
```

### `rescue`

Analyze and prepare atomic shielding of leaked assets.

#### Syntax

```bash
solvoid-scan rescue <address> [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `address` | Solana public key to rescue | Yes |

#### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--auto-shield` | Automatically execute shielding | `false` |
| `--max-amount` | Maximum amount to shield (SOL) | `unlimited` |
| `--exclude-tokens` | Exclude specific tokens | `none` |
| `--dry-run` | Simulate without executing | `true` |
| `--priority-fee` | Priority fee for transactions | `0.001` |

#### Examples

```bash
# Analyze rescue requirements
solvoid-scan rescue 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Execute automatic shielding (dangerous!)
solvoid-scan rescue 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --auto-shield

# Dry run with limits
solvoid-scan rescue 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --dry-run --max-amount 10.0
```

#### Output

```
┌─────────────────────────────────────────────────────────────────────┐
│                           RESCUE ANALYSIS                           │
├─────────────────────────────────────────────────────────────────────┤
│ Address:     9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM            │
│ Status:      ⚠️  LEAKS DETECTED                                      │
├─────────────────────────────────────────────────────────────────────┤
│ ANALYSIS RESULTS                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Leaks Found:       3                                                │
│ Current Score:     45/100                                           │
│ Potential Score:   85/100                                           │
│ Assets at Risk:    8.5 SOL                                          │
│ Shielding Cost:    0.025 SOL                                        │
├─────────────────────────────────────────────────────────────────────┤
│ RECOMMENDED ACTIONS                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Shield 5.0 SOL from vulnerable transaction                      │
│ 2. Use randomized withdrawal timing                                 │
│ 3. Avoid direct CEX links                                           │
│                                                                     │
│ Execute with: --auto-shield (⚠️  IRREVERSIBLE)                       │
└─────────────────────────────────────────────────────────────────────┘
```

### `shield`

Execute a private deposit with surgical shielding.

#### Syntax

```bash
solvoid-scan shield <amount> [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `amount` | Amount to shield (in SOL) | Yes |

#### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--recipient` | Custom recipient address | `current wallet` |
| `--delay` | Delay before commitment (seconds) | `0` |
| `--save-secrets` | Save secrets to file | `true` |
| `--secrets-file` | Custom secrets file path | `./solvoid-secrets.json` |
| `--fee-tier` | Fee tier (low, medium, high) | `medium` |
| `--confirm` | Require confirmation before execution | `true` |

#### Examples

```bash
# Shield 1 SOL
solvoid-scan shield 1.0

# Shield with custom recipient
solvoid-scan shield 2.5 --recipient 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Shield with delay for better privacy
solvoid-scan shield 1.0 --delay 300

# High priority shielding
solvoid-scan shield 0.5 --fee-tier high
```

#### Output

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SHIELDING OPERATION                         │
├─────────────────────────────────────────────────────────────────────┤
│ Amount:      1.000000000 SOL                                         │
│ Status:      ✅ COMMITMENT GENERATED                                 │
├─────────────────────────────────────────────────────────────────────┤
│ COMMITMENT DATA                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Secret:      a1b2c3d4e5f6789012345678901234567890abcdef1234567890   │
│ Nullifier:   789abc123def456789012345678901234567890abcdef1234567   │
│ Commitment:  fedcba0987654321fedcba0987654321fedcba0987654321fedc   │
│ Index:       854733                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ ⚠️  SAVE THESE SECRETS SECURELY - THEY CANNOT BE RECOVERED!        │
├─────────────────────────────────────────────────────────────────────┤
│ Secrets saved to: ./solvoid-secrets.json                            │
│ Next step: Broadcast transaction via wallet                          │
└─────────────────────────────────────────────────────────────────────┘
```

### `withdraw`

Execute anonymous withdrawal using ZK proofs.

#### Syntax

```bash
solvoid-scan withdraw <secret> <nullifier> <recipient> [options]
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `secret` | Secret from shield operation | Yes |
| `nullifier` | Nullifier from shield operation | Yes |
| `recipient` | Recipient public key | Yes |

#### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--amount` | Withdrawal amount (SOL) | `full commitment` |
| `--fee` | Relayer fee (SOL) | `0.005` |
| `--wasm` | Custom WASM circuit file | `./withdraw.wasm` |
| `--zkey` | Custom proving key file | `./withdraw.zkey` |
| `--relayer-only` | Use only relayer for broadcast | `true` |
| `--proof-timeout` | Proof generation timeout (seconds) | `120` |

#### Examples

```bash
# Basic withdrawal
solvoid-scan withdraw a1b2c3d4e5f6789012345678901234567890abcdef1234567890 \
                  789abc123def456789012345678901234567890abcdef1234567 \
                  9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Partial withdrawal with custom fee
solvoid-scan withdraw a1b2c3d4... 789abc123... 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
                  --amount 0.5 --fee 0.01

# Using custom circuit files
solvoid-scan withdraw a1b2c3d4... 789abc123... 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM \
                  --wasm ./custom-circuits/withdraw.wasm \
                  --zkey ./custom-circuits/withdraw.zkey
```

#### Output

```
┌─────────────────────────────────────────────────────────────────────┐
│                       WITHDRAWAL OPERATION                          │
├─────────────────────────────────────────────────────────────────────┤
│ Recipient:   9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM            │
│ Amount:      1.000000000 SOL                                         │
│ Status:      ✅ PROOF GENERATED                                     │
├─────────────────────────────────────────────────────────────────────┤
│ ZK PROOF DATA                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Proof:           8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9 |
│ Nullifier Hash:  1i2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9 |
│ Merkle Root:     4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k0l1m2 |
│ Proof Size:      1,024 bytes                                        │
│ Generation Time: 2.3 seconds                                        │
├─────────────────────────────────────────────────────────────────────┤
│ TRANSACTION DETAILS                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Fee:            0.005000000 SOL                                      │
│ Net Amount:     0.995000000 SOL                                      │
│ Relayer:        https://relayer.solvoid.io                           │
│ Status:         Ready for broadcast                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### `status`

Check system status and configuration.

#### Syntax

```bash
solvoid-scan status [options]
```

#### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--check-relayer` | Test relayer connectivity | `true` |
| `--check-program` | Verify program deployment | `true` |
| `--show-config` | Display current configuration | `true` |
| `--network-info` | Show network information | `true` |

#### Examples

```bash
# Basic status check
solvoid-scan status

# Detailed status with all checks
solvoid-scan status --check-relayer --check-program --show-config
```

#### Output

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SYSTEM STATUS                              │
├─────────────────────────────────────────────────────────────────────┤
│ Version:     1.0.0                                                   │
│ Network:     mainnet-beta                                            │
│ RPC:         https://api.mainnet-beta.solana.com                     │
├─────────────────────────────────────────────────────────────────────┤
│ CONNECTIVITY                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ RPC Status:       ✅ Connected (45ms latency)                       │
│ Relayer Status:   ✅ Healthy (3 relayers online)                    │
│ Program Status:   ✅ Deployed and verified                           │
├─────────────────────────────────────────────────────────────────────┤
│ PRIVACY METRICS                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Total Commitments:    854,733                                       │
│ Anonymity Set:        854,733                                       │
│ Tree Depth:           20                                             │
│ Merkle Root:          fedcba0987654321fedcba0987654321fedcba0987654321 |
├─────────────────────────────────────────────────────────────────────┤
│ CONFIGURATION                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Program ID:      Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i      │
│ Relayer URL:     https://relayer.solvoid.io                         │
│ Wallet:          ~/.config/solana/id.json                            │
└─────────────────────────────────────────────────────────────────────┘
```

### `config`

Manage CLI configuration.

#### Syntax

```bash
solvoid-scan config <action> [key] [value]
```

#### Actions

| Action | Description |
|--------|-------------|
| `get` | Get configuration value |
| `set` | Set configuration value |
| `list` | List all configuration |
| `reset` | Reset to defaults |
| `validate` | Validate current configuration |

#### Examples

```bash
# List all configuration
solvoid-scan config list

# Set custom RPC
solvoid-scan config set rpc https://rpc.ankr.com/solana

# Get current program ID
solvoid-scan config get program

# Reset configuration
solvoid-scan config reset

# Validate configuration
solvoid-scan config validate
```

## Configuration

### Configuration File

The CLI stores configuration in `~/.solvoid/config.json`:

```json
{
  "rpc": "https://api.mainnet-beta.solana.com",
  "program": "Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i",
  "relayer": "https://relayer.solvoid.io",
  "keypair": "~/.config/solana/id.json",
  "output": "table",
  "feeTier": "medium",
  "confirm": true,
  "saveSecrets": true,
  "secretsFile": "./solvoid-secrets.json"
}
```

### Network Profiles

Create profiles for different networks:

```bash
# Create devnet profile
solvoid-scan config set profile devnet
solvoid-scan config set rpc https://api.devnet.solana.com
solvoid-scan config set program 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

# Switch profiles
solvoid-scan config use-profile devnet

# List profiles
solvoid-scan config list-profiles
```

## Advanced Usage

### Batch Operations

```bash
# Scan multiple addresses
echo "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZ567890ABC123DEF" | \
xargs -I {} solvoid-scan protect {} --output json

# Batch shield multiple amounts
for amount in 0.1 0.5 1.0 2.0; do
  solvoid-scan shield $amount --delay $((RANDOM % 300))
done
```

### Automation Scripts

```bash
#!/bin/bash
# privacy-monitor.sh - Monitor address privacy

ADDRESS=$1
THRESHOLD=${2:-50}

if [ -z "$ADDRESS" ]; then
  echo "Usage: $0 <address> [threshold]"
  exit 1
fi

# Get privacy score
SCORE=$(solvoid-scan protect $ADDRESS --output json | jq '.privacyScore')

if [ "$SCORE" -lt "$THRESHOLD" ]; then
  echo "⚠️  Privacy score ($SCORE) below threshold ($THRESHOLD)"
  
  # Auto-rescue if configured
  if [ "$AUTO_RESCUE" = "true" ]; then
    echo "Executing auto-rescue..."
    solvoid-scan rescue $ADDRESS --auto-shield
  fi
else
  echo "✅ Privacy score ($SCORE) is healthy"
fi
```

### Integration with Other Tools

```bash
# Integrate with Solana CLI
solvoid-scan protect $(solana address) --output json | jq '.leaks | length'

# Use with jq for data processing
solvoid-scan protect 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --output json | \
jq '.passport.metrics.totalShielded / 1000000000' | \
xargs printf "Total shielded: %.2f SOL\n"

# Pipe to monitoring systems
solvoid-scan status --output json | \
jq '{privacyScore: .privacyMetrics.anonymitySet, status: .connectivity}' | \
curl -X POST https://monitoring.example.com/metrics -d @-
```

## Troubleshooting

### Common Issues

#### "Connection timeout to RPC"

```bash
# Test RPC connectivity
curl -X POST https://api.mainnet-beta.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}'

# Use alternative RPC
solvoid-scan protect <address> --rpc https://rpc.ankr.com/solana
```

#### "Invalid commitment format"

```bash
# Verify commitment format
echo "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456" | \
wc -c  # Should be 65 characters (64 + newline)

# Regenerate commitment
solvoid-scan shield 1.0 --save-secrets
```

#### "ZK proof generation failed"

```bash
# Check circuit files
ls -la withdraw.wasm withdraw.zkey

# Verify circuit integrity
sha256sum withdraw.wasm withdraw.zkey

# Regenerate circuits if needed
npm run build-circuits
```

#### "Insufficient funds"

```bash
# Check wallet balance
solana balance

# Check required amount + fees
solvoid-scan shield 1.0 --dry-run
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Enable debug output
DEBUG=solvoid:* solvoid-scan protect <address> --verbose

# Save debug logs
solvoid-scan protect <address> --verbose 2>&1 | tee debug.log
```

### Getting Help

```bash
# General help
solvoid-scan --help

# Command-specific help
solvoid-scan protect --help
solvoid-scan shield --help

# Version information
solvoid-scan --version
```

### Support Channels

- **Documentation**: https://docs.solvoid.io
- **GitHub Issues**: https://github.com/solvoid/solvoid/issues
- **Discord Community**: https://discord.gg/solvoid
- **Email Support**: support@solvoid.io

---

For more advanced usage patterns and integration examples, see our [Developer Guide](./DEVELOPMENT.md).
