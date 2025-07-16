"use client";

import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import idl from "../../idl.json";

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function getProgram(wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed"
  });
  return new Program(idl, provider);
}

export async function mintTicket(wallet, event) {
    const program = getProgram(wallet);
    const attendeeTokenAccount = await getAssociatedTokenAddress(
        event.account.tokenMint,
        wallet.publicKey
    );
    console.log('attendeeTokenAccount: ', attendeeTokenAccount);
    console.log('program.methods: ', program.methods);

    const res = await program.methods
      .mintTicket(event.account.name)
      .accounts({
        user: wallet.publicKey,
        userTokenAccount: attendeeTokenAccount,
        event: event.publicKey,
        tokenMint: event.account.tokenMint,
        organizer: event.account.organizer,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY
      })
      .rpc();
    
    console.log('res: ', res);
    return res;
}

export async function getEvents(wallet) {
    const program = getProgram(wallet);
    return await program.account.event.all();
}

// Helper to create an event
export async function createEvent(wallet, { name, date }) {
  const program = getProgram(wallet);
  
  const operatorPublicKey = wallet.publicKey.toBuffer();
  const bufferedName = Buffer.from(name);

  // Derive the event PDA (seeds: ["event", organizer, event_name])
  const [eventPda] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("event"),
      operatorPublicKey,
      bufferedName,
    ],
    program.programId
  );
  const [tokenMintPda] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("token_mint"),
      operatorPublicKey,
      bufferedName,
    ],
    program.programId
  );

  return await program.methods
    .createEvent(name, date)
    .accounts({
      event: eventPda,
      tokenMint: tokenMintPda,
      organizer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY
    })
    .rpc();
}

export async function getWalletTickets(wallet) {
  const ALL_EVENTS = await getEvents();

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });

  return tokenAccounts.value
    .map((token) => {
      return {
        eventName: ALL_EVENTS.find(_ => _.account.tokenMint == token.account.data.parsed.info.mint).account.name,
        numberOfTickets: token.account.data.parsed.info.tokenAmount.amount,
        mint: token.account.data.parsed.info.mint,
        wallet: token.pubkey.toBase58(), //publicKey.toBase58(),
      };
    });
}