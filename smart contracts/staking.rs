use anchor_lang::prelude::*;

declare_id!("HEqjbSEneAypSr9p8RhrjuK4wz98jfDZykmEDyjBcX4m");

#[program]
pub mod credential_verifier {
    use super::*;

    pub fn initialize_credential(
        ctx: Context<InitializeCredential>,
        credential_id: String,
        stake_amount: u64,
    ) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        let clock = Clock::get()?;

        credential.credential_id = credential_id;
        credential.stake_amount = stake_amount;
        credential.verifications = 0;
        credential.authentic_votes = 0;
        credential.total_staked = 0;
        credential.is_finalized = false;
        credential.created_at = clock.unix_timestamp;
        Ok(())
    }

    pub fn stake_for_credential(ctx: Context<StakeForCredential>) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        let verifier = &mut ctx.accounts.verifier;
        let clock = Clock::get()?;

        // Check if within 5-day window
        let time_elapsed = clock.unix_timestamp - credential.created_at;
        let five_days_in_secs = 5 * 24 * 60 * 60;
        require!(
            time_elapsed <= five_days_in_secs,
            VerifierError::StakingPeriodEnded
        );
        require!(
            credential.verifications < 10,
            VerifierError::MaxVerifiersReached
        );

        require!(!credential.is_finalized, VerifierError::AlreadyFinalized);
        require!(
            verifier.credential == Pubkey::default(),
            VerifierError::AlreadyStaked
        );

        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.authority.to_account_info(),
            to: credential.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );

        anchor_lang::system_program::transfer(cpi_context, credential.stake_amount)?;

        verifier.credential = credential.key();
        verifier.authority = ctx.accounts.authority.key();
        verifier.has_voted = false;
        verifier.has_claimed = false;
        credential.total_staked += credential.stake_amount;
        credential.verifier_count += 1;

        Ok(())
    }

    pub fn make_decision(ctx: Context<MakeDecision>, is_authentic: bool) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        let verifier = &mut ctx.accounts.verifier;

        require!(!credential.is_finalized, VerifierError::AlreadyFinalized);
        require!(
            verifier.credential == credential.key(),
            VerifierError::NotStaked
        );
        require!(!verifier.has_voted, VerifierError::AlreadyVoted);

        credential.verifications += 1;
        if is_authentic {
            credential.authentic_votes += 1;
        }

        verifier.voted_authentic = is_authentic;
        verifier.has_voted = true;

        if credential.verifications == 10 {
            credential.is_finalized = true;
        }

        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        let verifier = &mut ctx.accounts.verifier;

        require!(credential.is_finalized, VerifierError::NotFinalized);
        require!(!verifier.has_claimed, VerifierError::AlreadyClaimed);
        require!(verifier.has_voted, VerifierError::NotVoted);

        let majority_voted_authentic = credential.authentic_votes > 5;
        let verifier_in_majority = verifier.voted_authentic == majority_voted_authentic;

        if verifier_in_majority {
            let majority_count = if majority_voted_authentic {
                credential.authentic_votes
            } else {
                10 - credential.authentic_votes
            };

            let reward_amount = credential
                .total_staked
                .checked_div(majority_count as u64)
                .unwrap();

            **credential.to_account_info().try_borrow_mut_lamports()? -= reward_amount;
            **ctx.accounts.authority.try_borrow_mut_lamports()? += reward_amount;
        }

        verifier.has_claimed = true;
        Ok(())
    }

    pub fn refund_expired_stakes(ctx: Context<RefundExpiredStakes>) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        let verifier = &mut ctx.accounts.verifier;
        let clock = Clock::get()?;

        let time_elapsed = clock.unix_timestamp - credential.created_at;
        let five_days_in_secs = 5 * 24 * 60 * 60;

        require!(
            time_elapsed >= five_days_in_secs,
            VerifierError::TimeoutNotReached
        );
        require!(
            credential.verifier_count < 10,
            VerifierError::EnoughVerifiers
        );
        require!(!verifier.has_claimed, VerifierError::AlreadyClaimed);
        require!(
            verifier.credential == credential.key(),
            VerifierError::NotStaked
        );

        let refund_amount = credential.stake_amount;

        **credential.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.authority.try_borrow_mut_lamports()? += refund_amount;

        verifier.has_claimed = true;
        credential.total_staked -= refund_amount;
        credential.verifier_count -= 1;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(credential_id: String)]
pub struct InitializeCredential<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + credential_id.len() + 8 + 4 + 4 + 8 + 1 + 8 + 4,
        seeds = [b"credential", credential_id.as_bytes()],
        bump
    )]
    pub credential: Account<'info, Credential>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeForCredential<'info> {
    #[account(mut)]
    pub credential: Account<'info, Credential>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1 + 1 + 1 + 32,
        seeds = [b"verifier", credential.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub verifier: Account<'info, Verifier>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeDecision<'info> {
    #[account(mut)]
    pub credential: Account<'info, Credential>,
    #[account(
        mut,
        seeds = [b"verifier", credential.key().as_ref(), authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub verifier: Account<'info, Verifier>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub credential: Account<'info, Credential>,
    #[account(
        mut,
        seeds = [b"verifier", credential.key().as_ref(), authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub verifier: Account<'info, Verifier>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundExpiredStakes<'info> {
    #[account(mut)]
    pub credential: Account<'info, Credential>,
    #[account(
        mut,
        seeds = [b"verifier", credential.key().as_ref(), authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub verifier: Account<'info, Verifier>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct Credential {
    pub credential_id: String,
    pub stake_amount: u64,
    pub verifications: u32,
    pub authentic_votes: u32,
    pub total_staked: u64,
    pub is_finalized: bool,
    pub created_at: i64,
    pub verifier_count: u32,
}

#[account]
#[derive(Default)]
pub struct Verifier {
    pub credential: Pubkey,
    pub authority: Pubkey,
    pub voted_authentic: bool,
    pub has_voted: bool,
    pub has_claimed: bool,
}

#[error_code]
pub enum VerifierError {
    #[msg("Credential verification is already finalized")]
    AlreadyFinalized,
    #[msg("Credential verification is not finalized yet")]
    NotFinalized,
    #[msg("Reward already claimed")]
    AlreadyClaimed,
    #[msg("Verifier has already voted")]
    AlreadyVoted,
    #[msg("Verifier has already staked")]
    AlreadyStaked,
    #[msg("Verifier has not staked for this credential")]
    NotStaked,
    #[msg("Verifier has not voted yet")]
    NotVoted,
    #[msg("Timeout period has not been reached yet")]
    TimeoutNotReached,
    #[msg("Enough verifiers have already staked")]
    EnoughVerifiers,
    #[msg("Staking period has ended")]
    StakingPeriodEnded,
    #[msg("Maximum number of verifiers reached")]
    MaxVerifiersReached,
}