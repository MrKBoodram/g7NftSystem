"use client";

import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import idl from "../../idl.json";
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function getProgram(wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed"
  });
  return new Program(idl, provider);
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