import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

// This will be updated with your actual program ID after deployment
export const PROGRAM_ID = new web3.PublicKey(
  "96MN7K4ArcwdguXMUmVphVaapp5xFyLzpKTrD8dKohGF"
);

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function getProgram(wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed"
  });

  // You'll need to import your IDL here after building
  const idl = require('../../../anchor-program/target/idl/anchor_program.json');
  return new Program(idl, PROGRAM_ID, provider);
}
