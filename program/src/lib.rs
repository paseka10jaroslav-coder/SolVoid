use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

declare_id!("Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i");

// Merkle Tree config for an anonymity set of ~1M deposits
const MERKLE_TREE_DEPTH: usize = 20;
const MAX_LEAVES: u64 = 1 << MERKLE_TREE_DEPTH;
const ROOT_HISTORY_SIZE: usize = 30;

#[program]
pub mod solvoid {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.deposit_amount = amount;
        state.next_index = 0;
        
        // Pre-compute zero hashes for empty branches
        let mut zero = [0u8; 32];
        let mut zeros = [[0u8; 32]; MERKLE_TREE_DEPTH];
        for i in 0..MERKLE_TREE_DEPTH {
            zeros[i] = zero;
            zero = keccak::hashv(&[&zero, &zero]).to_bytes();
        }
        state.zeros = zeros;
        state.root = zero;
        
        msg!("Initialized with denom: {} lamports", amount);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, commitment: [u8; 32]) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let index = state.next_index;
        require!(index < MAX_LEAVES, PrivacyError::TreeFull);

        // Standard incremental Merkle Tree update
        let mut current_level_hash = commitment;
        let mut i = index;

        for level in 0..MERKLE_TREE_DEPTH {
            if i % 2 == 0 {
                state.filled_subtrees[level] = current_level_hash;
                let left = current_level_hash;
                let right = state.zeros[level];
                current_level_hash = keccak::hashv(&[&left, &right]).to_bytes();
            } else {
                let left = state.filled_subtrees[level];
                let right = current_level_hash;
                current_level_hash = keccak::hashv(&[&left, &right]).to_bytes();
            }
            i /= 2;
        }

        let old_root = state.root;
        state.root = current_level_hash;
        state.add_root_to_history(old_root);
        state.next_index += 1;

        emit!(DepositEvent {
            commitment,
            index,
            new_root: current_level_hash,
        });

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.depositor.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, state.deposit_amount)?;

        Ok(())
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        nullifier_hash: [u8; 32],
        root: [u8; 32],
        proof: Vec<u8>,
        fee: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;

        // Ensure we're withdrawing against a valid historical state
        require!(state.is_known_root(root), PrivacyError::InvalidRoot);

        // Hand off verification to the mock verifier
        require!(
            verifier::verify_zk_proof(nullifier_hash, root, &proof),
            PrivacyError::InvalidProof
        );

        let total_amount = state.deposit_amount;
        let protocol_fee = total_amount.checked_div(1000).ok_or(PrivacyError::ArithmeticError)?;
        let final_fee = if fee > protocol_fee { fee } else { protocol_fee };
        
        require!(final_fee <= total_amount, PrivacyError::FeeExceedsDeposit);
        let recipient_amount = total_amount.checked_sub(final_fee).ok_or(PrivacyError::ArithmeticError)?;

        let vault_seed = b"vault";
        let vault_bump = ctx.bumps.vault;
        let signer_seeds = &[&vault_seed[..], &[vault_bump]];
        let signer = &[&signer_seeds[..]];

        // Pay the relayer their bounty
        if final_fee > 0 {
            let fee_cpi = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.relayer.to_account_info(),
                },
                signer,
            );
            anchor_lang::system_program::transfer(fee_cpi, final_fee)?;
        }

        // Send remaining balance to the fresh recipient
        let recipient_cpi = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
            signer,
        );
        anchor_lang::system_program::transfer(recipient_cpi, recipient_amount)?;

        msg!("Withdrawn: {} lamports (Fee: {})", recipient_amount, final_fee);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Large allocation for tree subtrees and root history
    #[account(init, payer = admin, space = 8 + 32 + (ROOT_HISTORY_SIZE * 32) + 1 + 8 + (MERKLE_TREE_DEPTH * 32) * 2 + 100)]
    pub state: Account<'info, GlobalState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub state: Account<'info, GlobalState>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nullifier_hash: [u8; 32])]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub state: Account<'info, GlobalState>,
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    /// CHECK: Recipient destination for the fund transfer
    pub recipient: UncheckedAccount<'info>,
    #[account(
        init, 
        payer = relayer, 
        space = 8 + 32, 
        seeds = [b"nullifier", nullifier_hash.as_ref()], 
        bump
    )]
    // Double-spend protection marker
    pub nullifier_record: Account<'info, NullifierRecord>,
    #[account(mut)]
    pub relayer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GlobalState {
    pub root: [u8; 32],
    pub root_history: [[u8; 32]; ROOT_HISTORY_SIZE],
    pub root_history_index: u8,
    pub next_index: u64,
    pub zeros: [[u8; 32]; MERKLE_TREE_DEPTH],
    pub filled_subtrees: [[u8; 32]; MERKLE_TREE_DEPTH],
    pub deposit_amount: u64,
}

#[account]
pub struct NullifierRecord {
    pub hash: [u8; 32],
}

#[event]
pub struct DepositEvent {
    pub commitment: [u8; 32],
    pub index: u64,
    pub new_root: [u8; 32],
}

impl GlobalState {
    pub fn is_known_root(&self, root: [u8; 32]) -> bool {
        if self.root == root {
            return true;
        }
        for i in 0..ROOT_HISTORY_SIZE {
            if self.root_history[i] == root {
                return true;
            }
        }
        false
    }

    pub fn add_root_to_history(&mut self, root: [u8; 32]) {
        self.root_history[self.root_history_index as usize] = root;
        self.root_history_index = (self.root_history_index + 1) % ROOT_HISTORY_SIZE as u8;
    }
}

#[error_code]
pub enum PrivacyError {
    #[msg("Invalid Merkle root")]
    InvalidRoot,
    #[msg("Nullifier already spent")]
    NullifierSpent,
    #[msg("Invalid Merkle proof")]
    InvalidProof,
    #[msg("Merkle Tree is full")]
    TreeFull,
    #[msg("Fee exceeds deposit amount")]
    FeeExceedsDeposit,
    #[msg("Arithmetic overflow or underflow")]
    ArithmeticError,
}

pub mod verifier {
    pub fn verify_zk_proof(
        _nullifier_hash: [u8; 32],
        _root: [u8; 32],
        _proof: &[u8],
    ) -> bool {
        // Mock verifier for build test
        true
    }
}

fn _verify_merkle_proof(leaf: [u8; 32], root: [u8; 32], proof: Vec<[u8; 32]>) -> bool {
    let mut current = leaf;
    for p in proof {
        current = if current < p {
            keccak::hashv(&[&current, &p]).to_bytes()
        } else {
            keccak::hashv(&[&p, &current]).to_bytes()
        };
    }
    current == root
}
