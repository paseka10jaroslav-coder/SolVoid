# CONTRIBUTING TO SOLVOID

[DOCUMENT_CLASS: PROTOCOL_CONTRIBUTION_GUIDE] | [REVISION: 2.1]

Thank you for your interest in contributing to the **SolVoid** Privacy Lifecycle Management (PLM) infrastructure. This document outlines the standards and procedures for submitting code to the protocol.

---

## 1. ENVIRONMENT SETUP

Engage the development environment by following these steps:

1.  **Clone Source**
    ```bash
    git clone https://github.com/brainless3178/SolVoid.git
    cd SolVoid
    ```

2.  **Initialize Node Stack**
    ```bash
    npm install
    ```

3.  **Build Binary Objects**
    ```bash
    npm run build
    ```

4.  **Execute Verify Node (Tests)**
    ```bash
    npm test
    ```

---

## 2. DEVELOPMENT WORKFLOWS

### [A] CLI TOOLING
To test the forensic scanner directly from source:
```bash
npx ts-node cli/solvoid-scan.ts protect [ADDRESS] --mock
```

### [B] TACTICAL DASHBOARD
To develop the high-fidelity web interface:
```bash
npm run dashboard:dev
```
The interface is located in the `/dashboard` directory but controllable from the root workspace.

---

## 3. CODE ARCHITECTURE STANDARDS

To maintain the integrity of the "Digital Fortress," all contributions must adhere to the following:

*   **Type Rigor**: Strict TypeScript enforcement. Explicit types are required for all public SDK interfaces.
*   **Privacy-First Logic**: No logic should ever log sensitive buffers (Secrets/Nullifiers) to standard output.
*   **Browser Safety**: SDK modules must remain environment-agnostic (using the `isBrowser` check for storage/logging).
*   **Merkle Integrity**: Changes to the `PrivacyShield` class must be verified against current on-chain Merkle tree math.

---

## 4. SUBMISSION PIPELINE

1.  **Fork \& Branch**: Create a feature-specific branch (`feature/zk-optimizations`).
2.  **Lint \& Audit**: Run `npm run lint` before submission.
3.  **Test Coverage**: New features must include unit tests in `/tests/unit`.
4.  **Documentation**: Update `README.md` or relevant sub-specs in `/documentation` if API surfaces change.
5.  **Pull Request**: Submit a detailed PR describing the architectural impact of the change.

---

## 5. SECURITY DISCLOSURE

If you identify a cryptographic vulnerability or a leakage bug, **DO NOT** open a public issue. Please follow the instructions in **[SECURITY.md](./SECURITY.md)** to ensure a coordinated disclosure.

---
[CONTRIBUTION_STATUS: OPEN] | [PR_POLICY: RIGOROUS]
