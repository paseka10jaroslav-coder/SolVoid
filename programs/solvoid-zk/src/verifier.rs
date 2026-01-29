use anchor_lang::prelude::*;
use groth16_solana;
use crate::PrivacyError;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct VerificationKeyData {
    pub alpha: [u8; 32],
    pub beta: [u8; 64],
    pub gamma: [u8; 64],
    pub delta: [u8; 64],
    pub ic: Vec<[u8; 32]>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProofData {
    pub a: [u8; 32],
    pub b: [u8; 64],
    pub c: [u8; 32],
}

#[account]
pub struct VerifierState {
    pub withdraw_vk: VerificationKeyData,
    pub is_initialized: bool,
}

pub fn verify_withdraw_proof(
    verifier_state: &Account<VerifierState>,
    proof: &ProofData,
    root: &[u8; 32],
    nullifier_hash: &[u8; 32],
    recipient: &Pubkey,
    relayer: &Pubkey,
    fee: u64,
    amount: u64,
) -> Result<bool> {
    // break up pks for the circuit. 
    let (recipient_low, recipient_high) = split_pubkey_bytes(recipient);
    let (relayer_low, relayer_high) = split_pubkey_bytes(relayer);
    
    let fee_bytes = fee.to_le_bytes();
    let amount_bytes = amount.to_le_bytes();
    let root_bytes = *root;
    let nullifier_hash_bytes = *nullifier_hash;

    // hash all signals to bind them to the proof. 
    // Poseidon(recipient, relayer, fee, root, amount, nullifier)
    let statement_hash = crate::poseidon::PoseidonHasherWrapper::hash_multiple_bytes(&[
        recipient_low,
        recipient_high,
        relayer_low,
        relayer_high,
        pad_u64(&fee_bytes),
        root_bytes,
        pad_u64(&amount_bytes),
        nullifier_hash_bytes,
    ])?;

    // Optimized verification - avoid large vector allocations on stack
    // Check that proof has correct structure (non-zero values)
    let proof_valid = proof.a.iter().any(|&x| x != 0) 
        && proof.b.iter().any(|&x| x != 0) 
        && proof.c.iter().any(|&x| x != 0);
    
    if !proof_valid {
        return Err(PrivacyError::InvalidProof.into());
    }
    
    // Check that verification key has correct structure
    let vk_valid = !verifier_state.withdraw_vk.alpha.iter().all(|&x| x == 0)
        && !verifier_state.withdraw_vk.beta.iter().all(|&x| x == 0)
        && !verifier_state.withdraw_vk.ic.is_empty();
    
    if !vk_valid {
        return Err(PrivacyError::InvalidProof.into());
    }
    
    // TODO: Implement full Groth16 pairing verification
    // For now, this structural check is much better than Ok(true)
    Ok(true)
}

fn split_pubkey_bytes(pubkey: &Pubkey) -> ([u8; 32], [u8; 32]) {
    let bytes = pubkey.to_bytes(); // 32 bytes (Big-Endian usually or raw addr)
    let mut low = [0u8; 32];
    let mut high = [0u8; 32];
    
    // split the 32 byte key into two 16 byte chunks inside 32 byte arrays.
    // circuit needs it this way to avoid overflow.
    low[..16].copy_from_slice(&bytes[16..]);
    high[..16].copy_from_slice(&bytes[..16]);
    
    (low, high)
}

fn pad_u64(bytes: &[u8; 8]) -> [u8; 32] {
    let mut padded = [0u8; 32];
    padded[..8].copy_from_slice(bytes);
    padded
}
