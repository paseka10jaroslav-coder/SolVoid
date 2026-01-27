use std::ops::Add;
use ark_snark::SNARK;
use anchor_lang::prelude::*;
use ark_bn254::{Bn254, Fr as BlsFr, G1Affine, G1Projective, G2Affine, G2Projective};
use ark_ec::{AffineRepr, CurveGroup};
use ark_ff::PrimeField;
use ark_groth16::{Groth16, Proof, VerifyingKey};
use ark_serialize::CanonicalDeserialize;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use crate::economics::EconomicState;
use crate::PrivacyError;

// BN254 field elements - using correct field types
use ark_bn254::{Fq, Fq2};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct VerificationKeyData {
    pub alpha: Vec<u8>,
    pub beta: Vec<u8>,
    pub gamma: Vec<u8>,
    pub delta: Vec<u8>,
    pub ic: Vec<Vec<u8>>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProofData {
    pub a: Vec<u8>,
    pub b: Vec<u8>,
    pub c: Vec<u8>,
}

#[account]
pub struct VerifierState {
    pub withdraw_vk: VerificationKeyData,
    pub deposit_vk: VerificationKeyData,
    pub is_initialized: bool,
}

impl VerifierState {
    pub const LEN: usize = 8 + // discriminator
        (32 + 64 + 64 + 64 + (4 + 32 * 10)) + // withdraw_vk (assuming max 10 IC points)
        (32 + 64 + 64 + 64 + (4 + 32 * 10)) + // deposit_vk
        1; // is_initialized
}

pub fn initialize_verifiers(
    ctx: Context<InitializeVerifier>,
    withdraw_vk_json: String,
    deposit_vk_json: String,
) -> Result<()> {
    let verifier_state = &mut ctx.accounts.verifier_state;

    // Parse and validate withdraw VK
    let withdraw_vk = deserialize_vk(&withdraw_vk_json)?;
    verifier_state.withdraw_vk = serialize_vk(&withdraw_vk)?;

    // Parse and validate deposit VK
    let deposit_vk = deserialize_vk(&deposit_vk_json)?;
    verifier_state.deposit_vk = serialize_vk(&deposit_vk)?;

    verifier_state.is_initialized = true;

    msg!("Verifiers initialized successfully");
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeVerifier<'info> {
    #[account(
        init,
        payer = authority,
        space = VerifierState::LEN,
        seeds = [b"verifier"],
        bump
    )]
    pub verifier_state: Account<'info, VerifierState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn verify_withdraw_proof(
    verifier_state: &VerifierState,
    proof_data: &ProofData,
    public_inputs: &[BlsFr],
) -> Result<bool> {
    // Deserialize VK and proof
    let vk = deserialize_stored_vk(&verifier_state.withdraw_vk)?;
    let _proof = deserialize_proof(proof_data)?;

    // Verify the proof
    let is_valid = verify_groth16_proof(&vk, &_proof, public_inputs)?;

    Ok(is_valid)
}

pub fn verify_deposit_proof(
    verifier_state: &VerifierState,
    proof_data: &ProofData,
    public_inputs: &[BlsFr],
) -> Result<bool> {
    // Deserialize VK and proof
    let vk = deserialize_stored_vk(&verifier_state.deposit_vk)?;
    let _proof = deserialize_proof(proof_data)?;

    // Verify the proof
    let is_valid = verify_groth16_proof(&vk, &_proof, public_inputs)?;

    Ok(is_valid)
}

// Helper function to serialize VK for storage
fn serialize_vk(vk: &VerifyingKey<Bn254>) -> Result<VerificationKeyData> {
    let mut alpha_bytes = Vec::new();
    let mut beta_bytes = Vec::new();
    let mut gamma_bytes = Vec::new();
    let mut delta_bytes = Vec::new();

    // Serialize G1 points (alpha, delta)
    ark_serialize::CanonicalSerialize::serialize_compressed(&vk.alpha_g1, &mut alpha_bytes)
        .map_err(|_| PrivacyError::InvalidProof)?;
    ark_serialize::CanonicalSerialize::serialize_compressed(&vk.delta_g2, &mut delta_bytes)
        .map_err(|_| PrivacyError::InvalidProof)?;

    // Serialize G2 points (beta, gamma)
    ark_serialize::CanonicalSerialize::serialize_compressed(&vk.beta_g2, &mut beta_bytes)
        .map_err(|_| PrivacyError::InvalidProof)?;
    ark_serialize::CanonicalSerialize::serialize_compressed(&vk.gamma_g2, &mut gamma_bytes)
        .map_err(|_| PrivacyError::InvalidProof)?;

    // Serialize IC points
    let mut ic_bytes = Vec::new();
    for point in &vk.gamma_abc_g1 {
        let mut point_bytes = Vec::new();
        ark_serialize::CanonicalSerialize::serialize_compressed(point, &mut point_bytes)
            .map_err(|_| PrivacyError::InvalidProof)?;
        ic_bytes.push(point_bytes);
    }

    Ok(VerificationKeyData {
        alpha: alpha_bytes,
        beta: beta_bytes,
        gamma: gamma_bytes,
        delta: delta_bytes,
        ic: ic_bytes,
    })
}

// Helper function to deserialize stored VK
fn deserialize_stored_vk(vk_data: &VerificationKeyData) -> Result<VerifyingKey<Bn254>> {
    let alpha_g1 = G1Affine::deserialize_compressed(&vk_data.alpha[..])
        .map_err(|_| PrivacyError::InvalidProof)?;
    let beta_g2 = G2Affine::deserialize_compressed(&vk_data.beta[..])
        .map_err(|_| PrivacyError::InvalidProof)?;
    let gamma_g2 = G2Affine::deserialize_compressed(&vk_data.gamma[..])
        .map_err(|_| PrivacyError::InvalidProof)?;
    
    let mut gamma_abc_g1 = Vec::new();
    for ic_bytes in &vk_data.ic {
        let point = G1Affine::deserialize_compressed(&ic_bytes[..])
            .map_err(|_| PrivacyError::InvalidProof)?;
        gamma_abc_g1.push(point);
    }

    Ok(VerifyingKey {
        alpha_g1,
        beta_g2,
        gamma_g2,
        delta_g2: G2Affine::deserialize_compressed(&vk_data.delta[..])
            .map_err(|_| PrivacyError::InvalidProof)?,
        gamma_abc_g1,
    })
}

#[derive(Deserialize, Serialize)]
struct VKJson {
    #[serde(rename = "vk_alpha_1")]
    alpha: Vec<String>,
    #[serde(rename = "vk_beta_2")]
    beta: Vec<Vec<String>>,
    #[serde(rename = "vk_gamma_2")]
    gamma: Vec<Vec<String>>,
    #[serde(rename = "vk_delta_2")]
    delta: Vec<Vec<String>>,
    #[serde(rename = "IC")]
    ic: Vec<Vec<String>>,
}

fn deserialize_vk(json_str: &str) -> Result<VerifyingKey<Bn254>> {
    let vk_json: VKJson = serde_json::from_str(json_str)
        .map_err(|_| PrivacyError::InvalidVerificationKey)?;

    // Parse alpha (G1 point)
    let alpha_g1 = parse_g1_from_json(&vk_json.alpha)?;
    validate_g1_point(&alpha_g1)?;

    // Parse beta (G2 point)
    let beta_g2 = parse_g2_from_json(&vk_json.beta)?;
    validate_g2_point(&beta_g2)?;

    // Parse gamma (G2 point)
    let gamma_g2 = parse_g2_from_json(&vk_json.gamma)?;
    validate_g2_point(&gamma_g2)?;

    // Parse delta (G2 point)
    let delta_g2 = parse_g2_from_json(&vk_json.delta)?;
    validate_g2_point(&delta_g2)?;

    // Parse IC points (array of G1 points)
    let mut gamma_abc_g1 = Vec::new();
    for ic_point in &vk_json.ic {
        let point = parse_g1_from_json(ic_point)?;
        validate_g1_point(&point)?;
        gamma_abc_g1.push(point);
    }

    Ok(VerifyingKey {
        alpha_g1,
        beta_g2,
        gamma_g2,
        delta_g2,
        gamma_abc_g1,
    })
}

fn parse_g1_from_json(coords: &[String]) -> Result<G1Affine> {
    if coords.len() != 3 {
        return Err(PrivacyError::InvalidCoordinates.into());
    }

    // Parse Fq field elements (base field for G1)
    let x = Fq::from_str(&coords[0])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let y = Fq::from_str(&coords[1])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let z = Fq::from_str(&coords[2])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;

    // Create projective point
    let projective = G1Projective::new(x, y, z);
    let affine = projective.into_affine();

    Ok(affine)
}

#[derive(Accounts)]
pub struct VerifyWithdraw<'info> {
    #[account(
        seeds = [b"verifier"],
        bump
    )]
    pub verifier_state: Account<'info, VerifierState>,

    #[account(mut)]
    pub _signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyDeposit<'info> {
    #[account(
        seeds = [b"verifier"],
        bump
    )]
    pub verifier_state: Account<'info, VerifierState>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

pub fn calculate_dynamic_fee(
    _ctx: &Context<VerifyWithdraw>,
    base_amount: u64,
    _proof: &ProofData,
    _economic_state: &EconomicState,
) -> Result<u64> {
    // Simple fee calculation: 1% of base amount
    let fee = base_amount
        .checked_mul(1)
        .and_then(|v| v.checked_div(100))
        .ok_or(PrivacyError::ArithmeticError)?;

    Ok(fee)
}

fn parse_g2_from_json(coords: &[Vec<String>]) -> Result<G2Affine> {
    if coords.len() != 3 {
        return Err(PrivacyError::InvalidCoordinates.into());
    }

    // Each coordinate is a pair of field elements [c0, c1]
    if coords[0].len() != 2 || coords[1].len() != 2 || coords[2].len() != 2 {
        return Err(PrivacyError::InvalidCoordinates.into());
    }

    // Parse Fq field elements for Fq2 coordinates
    let x1 = Fq::from_str(&coords[0][0])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let x2 = Fq::from_str(&coords[0][1])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let y1 = Fq::from_str(&coords[1][0])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let y2 = Fq::from_str(&coords[1][1])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let z1 = Fq::from_str(&coords[2][0])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;
    let z2 = Fq::from_str(&coords[2][1])
        .map_err(|_| PrivacyError::InvalidCoordinates)?;

    // Create Fq2 elements (extension field)
    let x = Fq2::new(x1, x2);
    let y = Fq2::new(y1, y2);
    let z = Fq2::new(z1, z2);

    // Create projective point
    let projective = G2Projective::new(x, y, z);
    let affine = projective.into_affine();

    Ok(affine)
}

fn validate_g1_point(point: &G1Affine) -> Result<()> {
    // Check if point is on curve
    if !point.is_on_curve() {
        return Err(PrivacyError::InvalidProof.into());
    }

    // Check if point is in correct subgroup
    if !point.is_in_correct_subgroup_assuming_on_curve() {
        return Err(PrivacyError::InvalidProof.into());
    }

    Ok(())
}

fn validate_g2_point(point: &G2Affine) -> Result<()> {
    // Check if point is on curve
    if !point.is_on_curve() {
        return Err(PrivacyError::InvalidProof.into());
    }

    // Check if point is in correct subgroup
    if !point.is_in_correct_subgroup_assuming_on_curve() {
        return Err(PrivacyError::InvalidProof.into());
    }

    Ok(())
}

#[derive(Deserialize, Serialize)]
struct ProofJson {
    pi_a: Vec<String>,
    pi_b: Vec<Vec<String>>,
    pi_c: Vec<String>,
}

fn deserialize_proof(proof_data: &ProofData) -> Result<Proof<Bn254>> {
    // Deserialize proof points
    let a = G1Affine::deserialize_compressed(&proof_data.a[..])
        .map_err(|_| PrivacyError::InvalidProof)?;
    let b = G2Affine::deserialize_compressed(&proof_data.b[..])
        .map_err(|_| PrivacyError::InvalidProof)?;
    let c = G1Affine::deserialize_compressed(&proof_data.c[..])
        .map_err(|_| PrivacyError::InvalidProof)?;

    Ok(Proof { a, b, c })
}

fn parse_hex_to_field(hex: &str) -> Result<BlsFr> {
    // Remove 0x prefix if present
    let hex_without_prefix = hex.strip_prefix("0x").unwrap_or(hex);

    // Parse hex string to field element
    BlsFr::from_str(hex_without_prefix)
        .map_err(|_| anchor_lang::error::Error::from(PrivacyError::InvalidCoordinates))
}

fn parse_public_inputs(inputs: &[String]) -> Result<Vec<BlsFr>> {
    inputs
        .iter()
        .map(|s| parse_hex_to_field(s))
        .collect::<Result<Vec<_>>>()
}

fn verify_groth16_proof(
    vk: &VerifyingKey<Bn254>,
    proof: &Proof<Bn254>,
    public_inputs: &[BlsFr],
) -> Result<bool> {
    // Ensure we have the correct number of public inputs
    if public_inputs.len() + 1 != vk.gamma_abc_g1.len() {
        return Err(PrivacyError::InvalidProof.into());
    }

    // Verify using arkworks Groth16 verifier
    let is_valid = Groth16::<Bn254>::verify(vk, public_inputs, proof)
        .map_err(|_| PrivacyError::ProofVerificationFailed)?;

    Ok(is_valid)
}

// Alternative manual verification implementation
fn verify_groth16_manual(
    vk: &VerifyingKey<Bn254>,
    proof: &Proof<Bn254>,
    public_inputs: &[BlsFr],
) -> Result<bool> {
    use ark_ec::pairing::Pairing;

    // Check public inputs length
    if public_inputs.len() + 1 != vk.gamma_abc_g1.len() {
        return Err(PrivacyError::InvalidPublicInputs.into());
    }

    // Compute vk_x = IC[0] + sum(public_input[i] * IC[i+1])
    let mut ic_sum = vk.gamma_abc_g1[0].into_group();

    for (i, public_input) in public_inputs.iter().enumerate() {
        let term = vk.gamma_abc_g1[i + 1].mul_bigint(public_input.into_bigint());
        ic_sum = ic_sum.add(term);
    }

    let vk_x = ic_sum.into_affine();

    // Verify pairing equation:
    // e(A, B) = e(alpha, beta) * e(vk_x, gamma) * e(C, delta)
    let _ic_gamma_pairing = Bn254::pairing(vk_x, vk.gamma_g2);
    let _alpha_beta_pairing = Bn254::pairing(vk.alpha_g1, vk.beta_g2);
    let _c_delta_pairing = Bn254::pairing(proof.c, vk.delta_g2);
    let _proof_pairing = Bn254::pairing(proof.a, proof.b);

    // Manual verification is complex and error-prone
    // Use arkworks Groth16 verifier instead
    return Err(PrivacyError::ManualVerifierDisabled.into());
}

// Convert stored VK to arkworks format
fn convert_to_arkworks_vk(vk_data: &VerificationKeyData) -> Result<VerifyingKey<Bn254>> {
    deserialize_stored_vk(vk_data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_field_parsing() {
        let hex = "0x1234567890abcdef";
        let result = parse_hex_to_field(hex);
        assert!(result.is_ok());
    }

    #[test]
    fn test_g1_point_validation() {
        // Test with identity point
        let point = G1Affine::identity();
        let result = validate_g1_point(&point);
        assert!(result.is_ok());
    }

    #[test]
    fn test_g2_point_validation() {
        // Test with identity point
        let point = G2Affine::identity();
        let result = validate_g2_point(&point);
        assert!(result.is_ok());
    }
}