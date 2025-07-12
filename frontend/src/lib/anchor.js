import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

// This will be updated with your actual program ID after deployment
export const PROGRAM_ID = new web3.PublicKey(
  "11111111111111111111111111111112"
);

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function getProgram(wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed"
  });

  // You'll need to import your IDL here after building
  // const idl = require('../../../anchor-program/target/idl/anchor_program.json');
  // return new Program(idl, PROGRAM_ID, provider);

  return null; // Placeholder until IDL is generated
}
