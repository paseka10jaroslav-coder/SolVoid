# GETTING STARTED WITH SOLVOID

[DOCUMENT_CLASS: ONBOARDING_GUIDE] | [PREREQUISITE: NODEJS_16]

This document outlines the deployment and initial verification of the SolVoid privacy stack.

---

## 1. INSTALLATION

The SolVoid toolchain is distributed via NPM. You can install the core SDK and CLI utility using the following command:

```bash
npm install solvoid
```

---

## 2. CONFIGURATION

SolVoid utilizes an environment-based configuration system. Create a `.env` file in the root of your project directory to define the operational parameters:

```env
# Primary Solana RPC Endpoint
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Shadow Vault Program Address
SOLVOID_PROGRAM_ID=Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i

# Relayer Service URL
SHADOW_RELAYER_URL=http://localhost:3000
```

---

## 3. INITIAL FORENSIC AUDIT

The first step in securing a wallet is to generate its **Privacy Passport**. This identifies existing identity leaks that require remediation.

```bash
# Execute a deep-scan of a wallet address
npx solvoid-scan protect <SOLANA_ADDRESS>
```

**Expected Output Analysis:**
The CLI will return a "Privacy Passport" report. Focus on any items marked with **[CRITICAL]** or **[HIGH]** severity. These typically represent direct links to your real-world identity or high-visibility metadata leaks.

---

## 4. ASSET SHIELDING (FIRST DEPOSIT)

Once a leak is identified, you can move assets into the Shadow Vault. This "shields" the assets, breaking their connection to the compromised history.

```bash
# Shield 1.0 SOL into the vault
npx solvoid-scan shield 1.0
```

**[!] IMPORTANT**: Ensure you capture and securely store the **Secret** and **Nullifier** hex strings returned by the command. These are the singular keys to your shielded assets.

---

## 5. RECOVERY & WITHDRAWAL

To recover your assets to a fresh, unlinkable address, execute the withdrawal command:

```bash
# Withdraw assets to a new recipient address
npx solvoid-scan withdraw <SECRET> <NULLIFIER> <RECIPIENT_ADDRESS>
```

---

## 6. NEXT STEPS

For more advanced integration or automated recovery workflows, consult the following resources:
*   **[Shielding Workflow](./SHIELDING_WORKFLOW.md)**: Logic for atomic multi-asset rescue.
*   **[CLI Reference](../reference/CLI.md)**: Comprehensive guide to advanced flags and enterprise features.
*   **[SDK Reference](../reference/SDK.md)**: Professional implementation details for protocol engineers.

---
[GUIDE_STATUS: VERIFIED] | [REVISION: 1.1]
