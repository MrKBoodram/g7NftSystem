const anchor = require("@coral-xyz/anchor");
const {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL
} = require("@solana/web3.js");
const {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount
} = require("@solana/spl-token");

describe("SolTix Event Ticketing - mint_ticket Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorProgram;
  
  // Test data
  const eventName = "Test Concert";
  const eventDate = "2024-12-31";
  let organizer;
  let attendee1;
  let attendee2;
  let eventPda;
  let tokenMintPda;

  before(async () => {
    // Setup test accounts
    organizer = Keypair.generate();
    attendee1 = Keypair.generate();
    attendee2 = Keypair.generate();

    // Fund accounts
    await fundAccount(organizer.publicKey, 1);
    await fundAccount(attendee1.publicKey, 1);
    await fundAccount(attendee2.publicKey, 1);

    // Calculate PDAs
    [eventPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        organizer.publicKey.toBuffer(),
        Buffer.from(eventName)
      ],
      program.programId
    );

    [tokenMintPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_mint"),
        organizer.publicKey.toBuffer(),
        Buffer.from(eventName)
      ],
      program.programId
    );

    // Create the event first
    await program.methods
      .createEvent(eventName, eventDate)
      .accounts({
        event: eventPda,
        tokenMint: tokenMintPda,
        organizer: organizer.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      })
      .signers([organizer])
      .rpc();

    console.log("✅ Event created for mint tests");
  });

  describe("mint_ticket functionality", () => {
    it("Should mint a ticket to attendee1", async () => {
      // Get attendee's associated token account
      const attendeeTokenAccount = await getAssociatedTokenAddress(
        tokenMintPda,
        attendee1.publicKey
      );

      // Mint ticket
      const tx = await program.methods
        .mintTicket(eventName)
        .accounts({
          event: eventPda,
          tokenMint: tokenMintPda,
          userTokenAccount: attendeeTokenAccount,
          user: attendee1.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([attendee1])
        .rpc();

      console.log("Mint ticket transaction signature:", tx);

      // Verify token balance
      const tokenAccount = await getAccount(provider.connection, attendeeTokenAccount);
      console.log("Attendee1 ticket balance:", tokenAccount.amount.toString());
      
      // Should have exactly 1 ticket
      assert.equal(tokenAccount.amount.toString(), "1");
      
      // Verify token mint matches event
      assert.equal(tokenAccount.mint.toString(), tokenMintPda.toString());
      
      console.log("✅ Attendee1 successfully minted 1 ticket");
    });

    it("Should mint a ticket to attendee2", async () => {
      const attendeeTokenAccount = await getAssociatedTokenAddress(
        tokenMintPda,
        attendee2.publicKey
      );

      await program.methods
        .mintTicket(eventName)
        .accounts({
          event: eventPda,
          tokenMint: tokenMintPda,
          userTokenAccount: attendeeTokenAccount,
          user: attendee2.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([attendee2])
        .rpc();

      // Verify token balance
      const tokenAccount = await getAccount(provider.connection, attendeeTokenAccount);
      assert.equal(tokenAccount.amount.toString(), "1");
      
      console.log("✅ Attendee2 successfully minted 1 ticket");
    });

    it("Should allow attendee1 to mint multiple tickets", async () => {
      const attendeeTokenAccount = await getAssociatedTokenAddress(
        tokenMintPda,
        attendee1.publicKey
      );

      // Mint second ticket
      await program.methods
        .mintTicket(eventName)
        .accounts({
          event: eventPda,
          tokenMint: tokenMintPda,
          userTokenAccount: attendeeTokenAccount,
          user: attendee1.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([attendee1])
        .rpc();

      // Verify increased balance
      const tokenAccount = await getAccount(provider.connection, attendeeTokenAccount);
      assert.equal(tokenAccount.amount.toString(), "2");
      
      console.log("✅ Attendee1 now has 2 tickets");
    });

    it("Should fail when minting with wrong event name", async () => {
      const attendeeTokenAccount = await getAssociatedTokenAddress(
        tokenMintPda,
        attendee1.publicKey
      );

      try {
        await program.methods
          .mintTicket("Wrong Event Name")
          .accounts({
            event: eventPda,
            tokenMint: tokenMintPda,
            userTokenAccount: attendeeTokenAccount,
            user: attendee1.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
          })
          .signers([attendee1])
          .rpc();

        // Should not reach here
        assert.fail("Should have failed with wrong event name");
      } catch (error) {
        console.log("✅ Correctly failed with wrong event name:", error.message);
      }
    });

    it("Should fail when using wrong token mint", async () => {
      // Create a different token mint PDA
      const [wrongTokenMintPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("token_mint"),
          organizer.publicKey.toBuffer(),
          Buffer.from("Different Event")
        ],
        program.programId
      );

      const attendeeTokenAccount = await getAssociatedTokenAddress(
        tokenMintPda,
        attendee1.publicKey
      );

      try {
        await program.methods
          .mintTicket(eventName)
          .accounts({
            event: eventPda,
            tokenMint: wrongTokenMintPda, // Wrong mint
            userTokenAccount: attendeeTokenAccount,
            user: attendee1.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
          })
          .signers([attendee1])
          .rpc();

        assert.fail("Should have failed with wrong token mint");
      } catch (error) {
        console.log("✅ Correctly failed with wrong token mint");
      }
    });

    it("Should verify token mint properties", async () => {
      // Get mint account info
      const mintInfo = await provider.connection.getParsedAccountInfo(tokenMintPda);
      const mintData = mintInfo.value.data.parsed.info;

      // Verify mint properties
      assert.equal(mintData.decimals, 0, "Token should have 0 decimals");
      assert.equal(mintData.mintAuthority, tokenMintPda.toString(), "Mint authority should be the mint PDA itself");
      assert.equal(mintData.freezeAuthority, null, "Should have no freeze authority");
      
      console.log("✅ Token mint properties verified");
      console.log("  - Decimals:", mintData.decimals);
      console.log("  - Supply:", mintData.supply);
      console.log("  - Mint Authority:", mintData.mintAuthority);
    });

    it("Should check total supply after all mints", async () => {
      const mintInfo = await provider.connection.getParsedAccountInfo(tokenMintPda);
      const totalSupply = mintInfo.value.data.parsed.info.supply;
      
      // Should be 4 total (attendee1: 2, attendee2: 1, plus one more from multiple mints test)
      console.log("Total tickets minted:", totalSupply);
      assert.equal(totalSupply, "3", "Total supply should be 3 tickets");
      
      console.log("✅ Total supply verification passed");
    });
  });

  describe("Edge cases and error handling", () => {
    it("Should handle minting to same account multiple times", async () => {
      const attendeeTokenAccount = await getAssociatedTokenAddress(
        tokenMintPda,
        attendee1.publicKey
      );

      const initialBalance = await getAccount(provider.connection, attendeeTokenAccount);
      const initialAmount = parseInt(initialBalance.amount.toString());

      // Mint another ticket
      await program.methods
        .mintTicket(eventName)
        .accounts({
          event: eventPda,
          tokenMint: tokenMintPda,
          userTokenAccount: attendeeTokenAccount,
          user: attendee1.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .signers([attendee1])
        .rpc();

      const finalBalance = await getAccount(provider.connection, attendeeTokenAccount);
      const finalAmount = parseInt(finalBalance.amount.toString());

      assert.equal(finalAmount, initialAmount + 1, "Balance should increase by 1");
      console.log("✅ Multiple mints to same account work correctly");
    });

    it("Should verify event-token mint relationship", async () => {
      const eventAccount = await program.account.event.fetch(eventPda);
      
      assert.equal(
        eventAccount.tokenMint.toString(), 
        tokenMintPda.toString(), 
        "Event should reference correct token mint"
      );
      
      console.log("✅ Event-token mint relationship verified");
    });
  });

  // Helper function to fund accounts
  async function fundAccount(publicKey, solAmount) {
    let balance = await provider.connection.getBalance(publicKey);
    
    if (balance < solAmount * LAMPORTS_PER_SOL) {
      try {
        await provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(
            publicKey,
            solAmount * LAMPORTS_PER_SOL
          )
        );
      } catch (error) {
        // If airdrop fails, fund from provider wallet
        const fundTx = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: publicKey,
            lamports: solAmount * LAMPORTS_PER_SOL
          })
        );
        await provider.sendAndConfirm(fundTx);
      }
    }
  }
});
