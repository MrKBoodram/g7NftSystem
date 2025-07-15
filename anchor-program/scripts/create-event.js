const anchor = require("@coral-xyz/anchor");
const fs = require('fs');
const os = require('os');

async function createEvent() {
  // Get arguments from command line
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node create-event.js <event_name> <event_date>");
    console.log("Example: node create-event.js 'Summer Festival' '2024-08-15'");
    process.exit(1);
  }

  const eventName = args[0];
  const eventDate = args[1];

  try {
    console.log(`🎫 Creating event: "${eventName}" on ${eventDate}`);
    
    // Set environment variables that Anchor expects
    process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
    process.env.ANCHOR_WALLET = `${os.homedir()}/.config/solana/id.json`;
    
    // Load wallet to show organizer
    const walletPath = `${os.homedir()}/.config/solana/id.json`;
    if (!fs.existsSync(walletPath)) {
      console.error("❌ Wallet not found at:", walletPath);
      process.exit(1);
    }
    
    const walletKeypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
    );
    
    console.log(`👤 Organizer: ${walletKeypair.publicKey.toString()}`);
    
    // Set up provider using Anchor's env method
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    
    // Get program from workspace (this should work better)
    const program = anchor.workspace.AnchorProgram;
    
    if (!program) {
      console.error("❌ Program not found in workspace");
      console.log("💡 Make sure you're running from the anchor-program directory");
      console.log("💡 Try: cd /Users/cristian/projects/encode/g7NftSystem/anchor-program && node scripts/create-event.js ...");
      process.exit(1);
    }
    
    console.log(`📋 Program ID: ${program.programId.toString()}`);
    
    // Calculate PDAs
    const [eventPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(eventName)
      ],
      program.programId
    );

    const [tokenMintPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_mint"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(eventName)
      ],
      program.programId
    );

    console.log(`📍 Event PDA: ${eventPda.toString()}`);
    console.log(`🪙 Token Mint PDA: ${tokenMintPda.toString()}`);
    
    // Check wallet balance
    const balance = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log(`💰 Balance: ${(balance / anchor.web3.LAMPORTS_PER_SOL).toFixed(2)} SOL`);
    
    if (balance < 0.01 * anchor.web3.LAMPORTS_PER_SOL) {
      console.error("❌ Insufficient balance. Get airdrop: https://faucet.solana.com/");
      return;
    }
    
    // Create the event
    console.log("🚀 Sending transaction...");
    
    const tx = await program.methods
      .createEvent(eventName, eventDate)
      .accounts({
        event: eventPda,
        tokenMint: tokenMintPda,
        organizer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      })
      .rpc();

    console.log(`✅ Event created successfully!`);
    console.log(`📋 Transaction: ${tx}`);
    console.log(`🔗 Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log(`🎫 Event Explorer: https://explorer.solana.com/address/${eventPda.toString()}?cluster=devnet`);
    
    // Verify the event was created
    try {
      const eventAccount = await program.account.event.fetch(eventPda);
      console.log(`\n📊 Event Details:`);
      console.log(`   Name: "${eventAccount.name}"`);
      console.log(`   Date: ${eventAccount.date}`);
      console.log(`   Organizer: ${eventAccount.organizer.toString()}`);
      console.log(`   Token Mint: ${eventAccount.tokenMint.toString()}`);
    } catch (fetchError) {
      console.log("⚠️  Event created but couldn't fetch details");
    }

  } catch (error) {
    console.error("❌ Error creating event:", error.message);
    
    if (error.message.includes("already in use")) {
      console.log("💡 This event name already exists for this organizer. Try a different name.");
    } else if (error.message.includes("insufficient")) {
      console.log("💡 Get more SOL: https://faucet.solana.com/");
    } else if (error.message.includes("ANCHOR_PROVIDER_URL")) {
      console.log("💡 Environment variables issue. Make sure Anchor.toml is correct.");
    }
  }
}

createEvent();
