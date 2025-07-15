use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, MintTo, InitializeMint};
use anchor_spl::associated_token::{AssociatedToken, Create};

declare_id!("5Ndp1zpUwYgXtwTEx74Dz1geE34PgccMLtcnU7o3xVp2");

#[program]
pub mod anchor_program {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        event_name: String,
        event_date: String,
    ) -> Result<()> {
        require!(event_name.len() <= 50, ErrorCode::EventNameTooLong);
        require!(event_date.len() <= 20, ErrorCode::InvalidEventDate);

        // Create mint account
        let rent = ctx.accounts.rent.to_account_info();
        let system_program = ctx.accounts.system_program.to_account_info();

        // Calculate rent for mint account
        let mint_account_size = 82; // Size of a mint account
        let lamports = Rent::get()?.minimum_balance(mint_account_size);

        // Create seeds for signing
        let organizer_key = ctx.accounts.organizer.key();
        let seeds = &[
            b"token_mint",
            organizer_key.as_ref(),
            event_name.as_bytes(),
            &[ctx.bumps.token_mint],
        ];
        let signer = &[&seeds[..]];

        // Create the mint account
        let create_account_ix = anchor_lang::solana_program::system_instruction::create_account(
            ctx.accounts.organizer.key,
            ctx.accounts.token_mint.key,
            lamports,
            mint_account_size as u64,
            &token::ID,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &create_account_ix,
            &[
                ctx.accounts.organizer.to_account_info(),
                ctx.accounts.token_mint.to_account_info(),
                system_program,
            ],
            signer,
        )?;

        // Initialize the mint
        let cpi_accounts = InitializeMint {
            mint: ctx.accounts.token_mint.to_account_info(),
            rent: rent,
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::initialize_mint(cpi_ctx, 0, ctx.accounts.token_mint.key, None)?;

        // Initialize event account
        let event = &mut ctx.accounts.event;
        event.name = event_name;
        event.date = event_date;
        event.organizer = ctx.accounts.organizer.key();
        event.token_mint = ctx.accounts.token_mint.key();
        event.bump = ctx.bumps.event;

        msg!("Event created: {} with token mint: {}", event.name, event.token_mint);
        Ok(())
    }

    pub fn mint_ticket(
        ctx: Context<MintTicket>,
        event_name: String,
    ) -> Result<()> {
        let event = &ctx.accounts.event;

        // Create seeds for signing
        let organizer_key = event.organizer;
        let seeds = &[
            b"token_mint",
            organizer_key.as_ref(),
            event_name.as_bytes(),
            &[ctx.bumps.token_mint],
        ];
        let signer = &[&seeds[..]];

        // Create associated token account if needed
        if ctx.accounts.user_token_account.data_is_empty() {
            let cpi_accounts = Create {
                payer: ctx.accounts.user.to_account_info(),
                associated_token: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            };
            let cpi_program = ctx.accounts.associated_token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            anchor_spl::associated_token::create(cpi_ctx)?;
        }

        // Mint 1 token to the user's token account
        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.token_mint.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::mint_to(cpi_ctx, 1)?;

        msg!("Ticket minted for event: {} to user: {}", event.name, ctx.accounts.user.key());
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(event_name: String)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = organizer,
        space = Event::LEN,
        seeds = [b"event", organizer.key().as_ref(), event_name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,

    /// CHECK: This account will be initialized as a SPL Token mint by the token program
    #[account(
        mut,
        seeds = [b"token_mint", organizer.key().as_ref(), event_name.as_bytes()],
        bump
    )]
    pub token_mint: UncheckedAccount<'info>,

    #[account(mut)]
    pub organizer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(event_name: String)]
pub struct MintTicket<'info> {
    #[account(
        seeds = [b"event", event.organizer.as_ref(), event_name.as_bytes()],
        bump = event.bump,
        constraint = event.token_mint == token_mint.key() @ ErrorCode::InvalidTokenMint
    )]
    pub event: Account<'info, Event>,

    /// CHECK: This is the token mint PDA
    #[account(
        mut,
        seeds = [b"token_mint", event.organizer.as_ref(), event_name.as_bytes()],
        bump,
        constraint = token_mint.key() == event.token_mint @ ErrorCode::InvalidTokenMint
    )]
    pub token_mint: UncheckedAccount<'info>,

    /// CHECK: This will be the user's associated token account
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct Event {
    pub name: String,        // 4 + 50 = 54 bytes
    pub date: String,        // 4 + 20 = 24 bytes
    pub organizer: Pubkey,   // 32 bytes
    pub token_mint: Pubkey,  // 32 bytes - The SPL Token mint for this event
    pub bump: u8,            // 1 byte
}

impl Event {
    const LEN: usize = 8 + 54 + 24 + 32 + 32 + 1; // 151 bytes
}

#[error_code]
pub enum ErrorCode {
    #[msg("Event name is too long")]
    EventNameTooLong,
    #[msg("Event date is invalid")]
    InvalidEventDate,
    #[msg("Invalid token mint for this event")]
    InvalidTokenMint,
}
