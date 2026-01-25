# Cryptographic Specification: ZK-SNARKs in SolVoid

SolVoid uses Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (ZK-SNARKs) to decouple asset ownership from transaction history.

## Proof System
- **Algorithm**: Groth16
- **Curve**: BN254 (alt_bn128)
- **Crs**: Performed via a trusted setup (Phase 2 contribution for production).

## Circuit Constraints

### 1. Merkle Inclusion
The circuit proves that the user knows a `secret` and `nullifier` such that `Poseidon(secret, nullifier)` matches a leaf in the Merkle Tree, and that the path to the provided `MerkleRoot` is valid.

```text
Input: leaf, path_indices, path_elements, root
Assert: ComputeMerkleRoot(leaf, path_indices, path_elements) === root
```

### 2. Nullifier Commitment
To prevent double-spending without revealing which leaf is being spent, the circuit outputs the `NullifierHash`.

```text
Input: secret, nullifier
Output: Poseidon(nullifier)
```

### 3. Destination Binding
To prevent proof-theft (malleability), the withdrawal address is passed as a public input and bound to the proof.

```text
Input: recipient_address, relayer_address, fee
Constraint: proof is only valid for these specific parameters.
```

## Poseidon Hash Function
We use the **Poseidon** hash function for all on-chain commitments because it is optimized for ZK circuits, significantly reducing the number of R1CS constraints compared to SHA-256 or Keccak.

## Security Parameter
- **Tree Depth**: 20 (Supports 1,048,576 unique deposits per vault).
- **Anonymity Set**: All funds of a specific "tier" (e.g., 1.0 SOL) are part of the same tree, regardless of when they were deposited.
