use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

declare_id!("AsjDSV316uhQKcGNfCECGBzj7eHwrYXho7CivhiQNJQ1");

#[program]
pub mod pash {
    use super::*;

    pub fn submit_degree(
        ctx: Context<DegreeSubmitCredential>,
        degree_name: String,
        college_name: String,
        passout_year: i64,
    ) -> Result<()> {
        msg!("Degree Name: {:?}", degree_name);
        msg!("College Name: {:?}", college_name);
        msg!("Passout Year: {:?}", passout_year);

        let credential = &mut ctx.accounts.credential;
        credential.user_address = *ctx.accounts.user.key;
        credential.degree_name = degree_name.clone();
        credential.college_name = college_name.clone();
        credential.passout_year = passout_year;
        credential.timestamp = Clock::get()?.unix_timestamp;
        credential.verifiers = Vec::new();
        credential.status = VerificationStatus::Pending;

        emit!(DegreeCredentialSubmitted {
            user: *ctx.accounts.user.key,
            degree_name,
            college_name,
            passout_year,
            timestamp: credential.timestamp,
        });

        Ok(())
    }
pub fn submit_project(
    ctx: Context<ProjectSubmitCredential>,
    project_name: String,
    project_description: String,
    collaborators: Option<Vec<String>>,
    start_date: i64,
    end_date: Option<i64>,
    currently_working: Option<bool>,
    project_link: String,
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    project.user_address = *ctx.accounts.user.key;
    project.project_name = project_name.clone();
    project.project_description = project_description;
    project.collaborators = collaborators;
    project.start_date = start_date;
    project.end_date = end_date;
    project.currently_working = currently_working;
    project.project_link = project_link;
    project.timestamp = Clock::get()?.unix_timestamp;
    project.status = VerificationStatus::Pending;
    project.verifiers = Vec::new();

    emit!(ProjectSubmitted {
        user: *ctx.accounts.user.key,
        project_name,
        timestamp: project.timestamp,
    });

    Ok(())
}

    pub fn submit_skill(
        ctx: Context<SkillSubmitCredential>,
        skill_name: String,
        proficiency_level: ProficiencyLevel,
        proof_link: String,
    ) -> Result<()> {
        let skill = &mut ctx.accounts.skill;
        skill.user_address = *ctx.accounts.user.key;
        skill.skill_name = skill_name.clone();
        skill.proficiency_level = proficiency_level;
        skill.proof_link = proof_link;
        skill.timestamp = Clock::get()?.unix_timestamp;
        skill.status = VerificationStatus::Pending;
        skill.verifiers = Vec::new();

        emit!(SkillSubmitted {
            user: *ctx.accounts.user.key,
            skill_name,
            timestamp: skill.timestamp,
        });

        Ok(())
    }

    pub fn submit_employment(
        ctx: Context<EmploymentSubmitCredential>,
        company_name: String,
        job_title: String,
        start_date: i64,
        end_date: Option<i64>,
        currently_working: Option<bool>,
    ) -> Result<()> {
        let employment = &mut ctx.accounts.employment;
        employment.user_address = *ctx.accounts.user.key;
        employment.company_name = company_name.clone();
        employment.job_title = job_title;
        employment.start_date = start_date;
        employment.end_date = end_date;
        employment.currently_working = currently_working;
        employment.timestamp = Clock::get()?.unix_timestamp;
        employment.status = VerificationStatus::Pending;
        employment.verifiers = Vec::new();

        emit!(EmploymentSubmitted {
            user: *ctx.accounts.user.key,
            company_name,
            timestamp: employment.timestamp,
        });

        Ok(())
    }

    pub fn submit_certificate(
        ctx: Context<CertificateSubmitCredential>,
        certification_name: String,
        issuer: String,
        date_of_issue: i64,
        proof_link: Option<String>,
    ) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;
        certificate.user_address = *ctx.accounts.user.key;
        certificate.certification_name = certification_name.clone();
        certificate.issuer = issuer;
        certificate.date_of_issue = date_of_issue;
        certificate.proof_link = proof_link;
        certificate.timestamp = Clock::get()?.unix_timestamp;
        certificate.status = VerificationStatus::Pending;
        certificate.verifiers = Vec::new();

        emit!(CertificateSubmitted {
            user: *ctx.accounts.user.key,
            certification_name,
            timestamp: certificate.timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct DegreeSubmitCredential<'info> {
    #[account(init, payer = user, space = 8 + 32 + 128 + 128 + 8)]
    pub credential: Account<'info, UserDegreeCredential>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct ProjectSubmitCredential<'info> {
    #[account(init, payer = user, space = 8 + 32 + 256 + 512 + 256 + 8 + 8 + 1 + 256 + 8 + 1 + 256)]
    pub project: Account<'info, ProjectCredential>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SkillSubmitCredential<'info> {
    #[account(init, payer = user, space = 8 + 32 + 128 + 1 + 256  + 8 + 1 + 256)]
    pub skill: Account<'info, SkillCredential>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EmploymentSubmitCredential<'info> {
    #[account(init, payer = user, space = 8 + 32 + 128 + 128 + 8 + 8 + 1 + 8 + 1 + 256)]
    pub employment: Account<'info, EmploymentCredential>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CertificateSubmitCredential<'info> {
    #[account(init, payer = user, space = 8 + 32 + 128 + 128 + 8 + 256 + 8 + 1 + 256)]
    pub certificate: Account<'info, CertificateCredential>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[account]
pub struct UserDegreeCredential {
    pub user_address: Pubkey,
    pub degree_name: String,
    pub college_name: String,
    pub passout_year: i64,
    pub status: VerificationStatus,
    pub timestamp: i64,
    pub verifiers: Vec<Pubkey>,
}
#[account]
pub struct ProjectCredential {
    pub user_address: Pubkey,
    pub project_name: String,
    pub project_description: String,
    pub collaborators: Option<Vec<String>>,
    pub start_date: i64,
    pub end_date: Option<i64>,
    pub currently_working: Option<bool>,
    pub project_link: String,
    pub timestamp: i64,
    pub status: VerificationStatus,
    pub verifiers: Vec<Pubkey>,
}

#[account]
pub struct SkillCredential {
    pub user_address: Pubkey,
    pub skill_name: String,
    pub proficiency_level: ProficiencyLevel,
    pub proof_link: String,
    pub timestamp: i64,
    pub status: VerificationStatus,
    pub verifiers: Vec<Pubkey>,
}

#[account]
pub struct EmploymentCredential {
    pub user_address: Pubkey,
    pub company_name: String,
    pub job_title: String,
    pub start_date: i64,
    pub end_date: Option<i64>,
    pub currently_working: Option<bool>,
    pub timestamp: i64,
    pub status: VerificationStatus,
    pub verifiers: Vec<Pubkey>,
}

#[account]
pub struct CertificateCredential {
    pub user_address: Pubkey,
    pub certification_name: String,
    pub issuer: String,
    pub date_of_issue: i64,
    pub proof_link: Option<String>,
    pub timestamp: i64,
    pub status: VerificationStatus,
    pub verifiers: Vec<Pubkey>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ProficiencyLevel {
    Beginner,
    Intermediate,
    Advanced,
}
#[event]
pub struct DegreeCredentialSubmitted {
    pub user: Pubkey,
    pub degree_name: String,
    pub college_name: String,
    pub passout_year: i64,
    pub timestamp: i64,
}
#[event]
pub struct ProjectSubmitted {
    pub user: Pubkey,
    pub project_name: String,
    pub timestamp: i64,
}

#[event]
pub struct SkillSubmitted {
    pub user: Pubkey,
    pub skill_name: String,
    pub timestamp: i64,
}

#[event]
pub struct EmploymentSubmitted {
    pub user: Pubkey,
    pub company_name: String,
    pub timestamp: i64,
}

#[event]
pub struct CertificateSubmitted {
    pub user: Pubkey,
    pub certification_name: String,
    pub timestamp:i64,
}