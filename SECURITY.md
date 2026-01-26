# SECURITY POLICY: SOLVOID CRYPTOGRAPHIC INFRASTRUCTURE

[DOCUMENT_CLASS: PROTOCOL_SECURITY_STANDARDS] | [REVISION: 1.2.4]

SolVoid utilizes state-of-the-art cryptographic primitives to enforce on-chain privacy. However, the efficacy of these tools depends on proper operational security (OpSec) by the user.

---

## 1. CRYPTOGRAPHIC GUARANTEES

SolVoid provides the following privacy enforcement layers:

### [A] SHADOW VAULT (ZK-SNARK)
*   **Guarantee**: Provides break-link anonymity for SOL assets within the commitment pool.
*   **Mechanism**: utilizes Groth16 ZK-SNARKs and a 20-level Merkle state tree.
*   **Anonymity Set**: Effectively 1,048,575 nodes.

### [B] FORENSIC SCANNER (AUDIT LAYER)
*   **Guarantee**: Identification of historical identity leaks.
*   **Mechanism**: Multi-layer telemetry analysis of instruction payloads and program state footprints.

---

## 2. KNOWN LIMITATIONS & THREAT MODEL

While SolVoid encrypts the link between sender and receiver, users must remain aware of external metadata leaks:

1.  **Transport Metadata**: SolVoid protects on-chain identity but and RPC endpoint can still see your IP address unless you utilize the **Shadow Relayer** or a VPN/Tor.
2.  **Timing Correlation**: Depositing and withdrawing high values within the same block or epoch can allow observers to correlate movements through statistical inference.
3.  **Amount Uniqueness**: SolVoid enforces fixed denominations (0.1, 1.0, 10.0 SOL) to prevent "Amount Fingerprinting." Avoid custom denominations to maintain maximum anonymity.

---

## 3. AUDIT STATUS

The SolVoid protocol and its ZK circuits are in **BETA STAGE**. 

*   **Circuits**: Non-audited but verified against public BN128 R1CS proofs.
*   **Program**: Anchor-based implementation with protocol-level safety checks.
*   **Trusted Setup**: The current ZKEY is generated via a standard Powers-of-Tau. A community-driven MPC ceremony is planned for production release.

---

## 4. REPORTING VULNERABILITIES

If you identify a security defect, cryptographic flaw, or leakage vector:

1.  **Do Not File a Public Issue**: Public disclosure before a patch is ready risks user funds.
2.  **Encrypted Submission**: Submit a detailed report to `security@solvoid.maintainers` (or via GitHub private security advisory).
3.  **Response Profile**: We aim to provide a technical triage within **24 hours**.

---

## 5. REPORTEE BEST PRACTICES

For maximum security when using the CLI or Tactical Dashboard:
*   Always verify the checksum of the `withdraw.wasm` file.
*   Back up your ZK-Notes (Secret/Nullifier) offline.
*   Route dashboard queries through a trusted, private RPC node.

---
[SECURITY_STATUS: AGGRESSIVE] | [ENFORCEMENT: CRYPTOGRAPHIC]
