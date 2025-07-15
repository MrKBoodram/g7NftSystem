import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

import idl from "../../idl.json";
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function getProgram(wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed"
  });
  return new Program(idl, provider);
}

export async function getEvents(wallet) {
    const program = getProgram(wallet);
    const r = await program.account.event.all();
    console.log('type: ', typeof(r));
    console.log('type: ', typeof(r[0]));
    return r;
}