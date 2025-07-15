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
    const r = await program.account.event.all();
    console.log('type: ', typeof(r));
    console.log('type: ', typeof(r[0]));
    return r;
}