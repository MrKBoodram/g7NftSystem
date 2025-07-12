const anchor = require("@coral-xyz/anchor");
const {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL
} = require("@solana/web3.js");

describe("anchor-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorProgram;

  it("Creates an event", async () => {
    const eventName = "Test Concert";
    const eventDate = "2024-12-31";

    const organizer = Keypair.generate();

    // Check if organizer needs airdrop
    let balance = await provider.connection.getBalance(organizer.publicKey);
    console.log(`Organizer balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      try {
        console.log("Requesting airdrop...");
        await provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(
            organizer.publicKey,
            0.1 * LAMPORTS_PER_SOL
          )
        );
      } catch (error) {
        console.log(
          "Airdrop failed, using provider wallet to fund organizer..."
        );

        // Use your wallet to send SOL to the test organizer
        const fundTx = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: organizer.publicKey,
            lamports: 0.1 * LAMPORTS_PER_SOL
          })
        );

        await provider.sendAndConfirm(fundTx);
        console.log("Funded organizer from provider wallet");
      }
    }

    // Find event PDA
    const [eventPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        organizer.publicKey.toBuffer(),
        Buffer.from(eventName)
      ],
      program.programId
    );

    try {
      const tx = await program.methods
        .createEvent(eventName, eventDate)
        .accounts({
          event: eventPda,
          organizer: organizer.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([organizer])
        .rpc();

      console.log("Transaction signature:", tx);

      const eventAccount = await program.account.event.fetch(eventPda);
      console.log("Event created:", {
        name: eventAccount.name,
        date: eventAccount.date,
        organizer: eventAccount.organizer.toString()
      });

      console.log("✅ Event creation test passed!");
    } catch (error) {
      console.error("❌ Test failed:", error);
      throw error;
    }
  });
});
