use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i");

#[program]
pub mod solvoid_zk {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let verifier_state = &mut ctx.accounts.verifier_state;
        verifier_state.is_initialized = true;
        Ok(())
    }

    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        proof_data: Vec<u8>,
        public_inputs: Vec<u8>,
    ) -> Result<bool> {
        // Simplified verification logic for demo
        msg!("Verifying proof with {} bytes", proof_data.len());
        msg!("Public inputs: {} bytes", public_inputs.len());
        
        // For demo purposes, we'll just return true
        // In production, this would call the actual Groth16 verification
        Ok(true)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 1 // discriminator + is_initialized
    )]
    pub verifier_state: Account<'info, VerifierState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyProof<'info> {
    pub verifier_state: Account<'info, VerifierState>,
}

#[account]
pub struct VerifierState {
    pub is_initialized: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof")]
    InvalidProof,
    #[msg("Verifier not initialized")]
    NotInitialized,
}
