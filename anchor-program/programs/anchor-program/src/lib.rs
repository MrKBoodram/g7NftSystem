use anchor_lang::prelude::*;

declare_id!("96MN7K4ArcwdguXMUmVphVaapp5xFyLzpKTrD8dKohGF");

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

        let event = &mut ctx.accounts.event;
        event.name = event_name;
        event.date = event_date;
        event.organizer = ctx.accounts.organizer.key();
        event.bump = ctx.bumps.event;
        
        msg!("Event created: {}", event.name);
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
    
    #[account(mut)]
    pub organizer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Event {
    pub name: String,        // 4 + 50 = 54 bytes
    pub date: String,        // 4 + 20 = 24 bytes
    pub organizer: Pubkey,   // 32 bytes
    pub bump: u8,            // 1 byte
}

impl Event {
    const LEN: usize = 8 + 54 + 24 + 32 + 1; // 119 bytes
}

#[error_code]
pub enum ErrorCode {
    #[msg("Event name is too long")]
    EventNameTooLong,
    #[msg("Event date is invalid")]
    InvalidEventDate,
}