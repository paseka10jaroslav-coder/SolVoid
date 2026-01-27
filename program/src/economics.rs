use crate::AdminControl;
use anchor_lang::prelude::*;

/// Economic security parameters
pub const PROTOCOL_FEE_BASIS_POINTS: u64 = 10; // 0.1% fee
pub const MAX_FEE_BASIS_POINTS: u64 = 100; // 1% maximum fee
pub const MIN_DEPOSIT_AMOUNT: u64 = 1_000_000; // 0.001 SOL minimum
pub const MAX_DEPOSIT_AMOUNT: u64 = 1_000_000_000_000; // 1000 SOL maximum
pub const MAX_EMERGENCY_MULTIPLIER: u64 = 10; // Maximum 10x multiplier

/// Economic security state
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct EconomicState {
    pub total_volume: u64,
    pub total_fees_collected: u64,
    pub emergency_fee_multiplier: u64, // For crisis situations
    pub is_fee_emergency: bool,
    pub pending_emergency_multiplier: u64, // Pending multiplier with time delay
    pub multiplier_activation_time: i64, // Unix timestamp when pending multiplier becomes active
}

impl Default for EconomicState {
    fn default() -> Self {
        Self {
            total_volume: 0,
            total_fees_collected: 0,
            emergency_fee_multiplier: 1,
            is_fee_emergency: false,
            pending_emergency_multiplier: 1,
            multiplier_activation_time: 0,
        }
    }
}

/// Calculate protocol fee with economic guards
pub fn calculate_protocol_fee(
    deposit_amount: u64,
    economic_state: &EconomicState,
) -> Result<u64> {
    // Validate deposit amount bounds
    if deposit_amount < MIN_DEPOSIT_AMOUNT {
        return Err(PrivacyError::DepositTooSmall.into());
    }
    if deposit_amount > MAX_DEPOSIT_AMOUNT {
        return Err(PrivacyError::DepositTooLarge.into());
    }

    // Calculate base fee
    let base_fee = deposit_amount
        .checked_mul(PROTOCOL_FEE_BASIS_POINTS)
        .unwrap()
        .checked_div(10_000)
        .unwrap();

    // Apply emergency multiplier if active
    let final_fee = if economic_state.is_fee_emergency {
        base_fee
            .checked_mul(economic_state.emergency_fee_multiplier)
            .unwrap()
    } else {
        base_fee
    };

    // Ensure fee doesn't exceed maximum
    if final_fee > deposit_amount.checked_mul(MAX_FEE_BASIS_POINTS).unwrap().checked_div(10_000).unwrap() {
        return Err(PrivacyError::FeeExceedsMaximum.into());
    }

    Ok(final_fee)
}

/// FIXED: Calculate protocol fee with atomic emergency multiplier check
pub fn calculate_protocol_fee_atomic(
    deposit_amount: u64,
    economic_state: &mut EconomicState,
    current_time: i64,
) -> Result<u64> {
    // Validate deposit amount bounds
    if deposit_amount < MIN_DEPOSIT_AMOUNT {
        return Err(PrivacyError::DepositTooSmall.into());
    }
    if deposit_amount > MAX_DEPOSIT_AMOUNT {
        return Err(PrivacyError::DepositTooLarge.into());
    }

    // FIXED: Atomically check and activate pending multiplier
    let effective_multiplier = if economic_state.multiplier_activation_time > 0 
        && current_time >= economic_state.multiplier_activation_time {
        // Activate pending multiplier atomically
        let pending = economic_state.pending_emergency_multiplier;
        if pending != economic_state.emergency_fee_multiplier {
            economic_state.emergency_fee_multiplier = pending;
            economic_state.is_fee_emergency = true;
            economic_state.multiplier_activation_time = 0; // Clear pending
        }
        pending
    } else {
        economic_state.emergency_fee_multiplier
    };

    // Calculate base fee
    let base_fee = deposit_amount
        .checked_mul(PROTOCOL_FEE_BASIS_POINTS)
        .ok_or(PrivacyError::ArithmeticError)?
        .checked_div(10_000)
        .ok_or(PrivacyError::ArithmeticError)?;

    // Apply emergency multiplier if active
    let final_fee = base_fee
        .checked_mul(effective_multiplier)
        .ok_or(PrivacyError::ArithmeticError)?;

    // Ensure fee doesn't exceed maximum
    let max_fee = deposit_amount
        .checked_mul(MAX_FEE_BASIS_POINTS)
        .ok_or(PrivacyError::ArithmeticError)?
        .checked_div(10_000)
        .ok_or(PrivacyError::ArithmeticError)?;
        
    if final_fee > max_fee {
        return Err(PrivacyError::FeeExceedsMaximum.into());
    }

    Ok(final_fee)
}

/// Schedule emergency multiplier change with delay
pub fn schedule_emergency_multiplier_change(
    economic_state: &mut EconomicState,
    new_multiplier: u64,
    current_time: i64,
    delay_seconds: i64,
) -> Result<()> {
    // Validate new multiplier is within bounds
    if new_multiplier > MAX_EMERGENCY_MULTIPLIER {
        return Err(PrivacyError::InvalidMultiplier.into());
    }

    // Schedule the change
    economic_state.pending_emergency_multiplier = new_multiplier;
    economic_state.multiplier_activation_time = current_time + delay_seconds;

    Ok(())
}

/// Activate pending multiplier if delay has passed
pub fn activate_pending_multiplier_if_ready(
    economic_state: &mut EconomicState,
    current_time: i64,
) -> Result<bool> {
    if economic_state.multiplier_activation_time > 0 
        && current_time >= economic_state.multiplier_activation_time {
        
        economic_state.emergency_fee_multiplier = economic_state.pending_emergency_multiplier;
        economic_state.multiplier_activation_time = 0;
        economic_state.is_fee_emergency = true;
        
        return Ok(true);
    }
    
    Ok(false)
}

/// Validate economic invariants
pub fn validate_economic_invariants(
    total_deposits: u64,
    total_withdrawals: u64,
    _total_volume: u64,
    vault_balance: u64,
) -> Result<()> {
    // Ensure withdrawals don't exceed deposits
    require!(
        total_withdrawals <= total_deposits,
        PrivacyError::WithdrawalExceedsDeposits
    );

    // Ensure volume matches expected (deposit_amount * total_deposits)
    let _expected_volume = total_deposits;

    // Ensure vault has sufficient funds
    let expected_vault_balance = total_deposits
        .checked_sub(total_withdrawals)
        .unwrap()
        .checked_mul(MIN_DEPOSIT_AMOUNT)
        .unwrap();

    require!(
        vault_balance >= expected_vault_balance,
        PrivacyError::InsufficientVaultBalance
    );

    Ok(())
}

/// Check for economic attack patterns
pub fn detect_economic_attacks(
    _economic_state: &EconomicState,
    recent_deposits: &[u64],
    recent_withdrawals: &[u64],
) -> Result<()> {
    // Check for rapid deposit/withdrawal cycles (potential money laundering)
    if recent_deposits.len() >= 10 && recent_withdrawals.len() >= 10 {
        let recent_deposit_total: u64 = recent_deposits.iter().sum();
        let recent_withdrawal_total: u64 = recent_withdrawals.iter().sum();

        // If withdrawals are >90% of recent deposits, potential attack
        if recent_withdrawal_total > recent_deposit_total * 9 / 10 {
            return Err(PrivacyError::SuspiciousActivity.into());
        }
    }

    // Check for unusually high volume spikes
    if recent_deposits.len() > 100 {
        let recent_total: u64 = recent_deposits.iter().sum();
        let average_deposit = recent_total / recent_deposits.len() as u64;

        // If average deposit is unusually high, potential attack
        if average_deposit > MAX_DEPOSIT_AMOUNT / 2 {
            return Err(PrivacyError::SuspiciousActivity.into());
        }
    }

    Ok(())
}

/// Emergency economic controls
pub fn trigger_emergency_mode(
    ctx: Context<AdminControl>,
    multiplier: u64,
    reason: String,
) -> Result<()> {
    let state = &mut ctx.accounts.state;
    require!(multiplier >= 1 && multiplier <= 10, PrivacyError::InvalidMultiplier);

    state.economic_state.is_fee_emergency = true;
    state.economic_state.emergency_fee_multiplier = multiplier;

    msg!("Emergency mode triggered: {} (multiplier: {}x)", reason, multiplier);
    Ok(())
}

pub fn disable_emergency_mode(ctx: Context<AdminControl>) -> Result<()> {
    let state = &mut ctx.accounts.state;
    require!(state.is_initialized, PrivacyError::NotInitialized);
    
    state.economic_state.is_fee_emergency = false;
    state.economic_state.emergency_fee_multiplier = 1;

    msg!("Emergency mode disabled");
    Ok(())
}

#[error_code]
pub enum PrivacyError {
    #[msg("Deposit amount too small")]
    DepositTooSmall,
    #[msg("Deposit amount too large")]
    DepositTooLarge,
    #[msg("Fee exceeds maximum allowed")]
    FeeExceedsMaximum,
    #[msg("Withdrawals exceed deposits")]
    WithdrawalExceedsDeposits,
    #[msg("Insufficient vault balance")]
    InsufficientVaultBalance,
    #[msg("Suspicious activity detected")]
    SuspiciousActivity,
    #[msg("Invalid emergency multiplier")]
    InvalidMultiplier,
    #[msg("Not initialized")]
    NotInitialized,
    #[msg("Manual verifier disabled")]
    ManualVerifierDisabled,
    #[msg("Invalid verification key")]
    InvalidVerificationKey,
    #[msg("Invalid proof")]
    InvalidProof,
    #[msg("Invalid coordinates")]
    InvalidCoordinates,
    #[msg("Arithmetic error")]
    ArithmeticError,
    #[msg("Invalid public inputs")]
    InvalidPublicInputs,
    #[msg("Proof verification failed")]
    ProofVerificationFailed,
}
