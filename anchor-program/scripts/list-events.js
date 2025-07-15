const anchor = require("@coral-xyz/anchor");
const fs = require('fs');
const os = require('os');

async function listAllEvents() {
  try {
    console.log("🔍 Fetching all SolTix events...\n");
    
    // Set environment variables that Anchor expects
    process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
    process.env.ANCHOR_WALLET = `${os.homedir()}/.config/solana/id.json`;
    
    // Set up provider using Anchor's env method
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    
    // Get program from workspace
    const program = anchor.workspace.AnchorProgram;
    
    if (!program) {
      console.error("❌ Program not found in workspace");
      console.log("💡 Make sure you're running from the anchor-program directory");
      process.exit(1);
    }
    
    console.log(`📋 Program ID: ${program.programId.toString()}`);
    console.log(`🌐 Network: Devnet`);
    console.log(`👤 Current Wallet: ${provider.wallet.publicKey.toString()}\n`);
    
    // Get all Event accounts created by your program
    const events = await program.account.event.all();
    
    if (events.length === 0) {
      console.log("❌ No events found on the blockchain.");
      console.log("💡 Create some events first with:");
      console.log("   node scripts/create-event.js 'Event Name' '2024-12-31'");
      return;
    }
    
    console.log(`✅ Found ${events.length} event(s):\n`);
    console.log("═".repeat(90));
    
    // Display each event with detailed information
    events.forEach((event, index) => {
      console.log(`🎫 Event #${index + 1}:`);
      console.log(`   📅 Name: "${event.account.name}"`);
      console.log(`   📆 Date: ${event.account.date}`);
      console.log(`   👤 Organizer: ${event.account.organizer.toString()}`);
      console.log(`   🪙 Token Mint: ${event.account.tokenMint.toString()}`);
      console.log(`   📍 Event PDA: ${event.publicKey.toString()}`);
      console.log(`   🔗 Event Explorer: https://explorer.solana.com/address/${event.publicKey.toString()}?cluster=devnet`);
      console.log(`   🎨 Token Explorer: https://explorer.solana.com/address/${event.account.tokenMint.toString()}?cluster=devnet`);
      
      // Check if this wallet is the organizer
      if (event.account.organizer.toString() === provider.wallet.publicKey.toString()) {
        console.log(`   👑 You are the organizer of this event`);
      }
      
      console.log("   " + "─".repeat(85));
    });
    
    // Summary statistics
    console.log("\n📊 Summary:");
    
    // Group events by organizer
    const eventsByOrganizer = events.reduce((acc, event) => {
      const organizer = event.account.organizer.toString();
      if (!acc[organizer]) acc[organizer] = [];
      acc[organizer].push(event);
      return acc;
    }, {});
    
    console.log(`   📈 Total Events: ${events.length}`);
    console.log(`   👥 Unique Organizers: ${Object.keys(eventsByOrganizer).length}`);
    
    // Show events by organizer
    console.log("\n👥 Events by Organizer:");
    Object.entries(eventsByOrganizer).forEach(([organizer, organizerEvents]) => {
      const isYou = organizer === provider.wallet.publicKey.toString();
      const label = isYou ? " (YOU)" : "";
      console.log(`   ${organizer}${label}: ${organizerEvents.length} event(s)`);
      
      organizerEvents.forEach(event => {
        console.log(`     🎫 "${event.account.name}" (${event.account.date})`);
      });
    });
    
    // Show upcoming events (basic date comparison)
    console.log("\n📅 Event Timeline:");
    const sortedEvents = events
      .map(event => ({
        ...event,
        dateObj: new Date(event.account.date)
      }))
      .sort((a, b) => a.dateObj - b.dateObj);
    
    const now = new Date();
    const upcoming = sortedEvents.filter(event => event.dateObj >= now);
    const past = sortedEvents.filter(event => event.dateObj < now);
    
    if (upcoming.length > 0) {
      console.log(`   🔮 Upcoming Events: ${upcoming.length}`);
      upcoming.slice(0, 3).forEach(event => {
        console.log(`     📅 "${event.account.name}" - ${event.account.date}`);
      });
    }
    
    if (past.length > 0) {
      console.log(`   📚 Past Events: ${past.length}`);
      past.slice(-3).forEach(event => {
        console.log(`     📅 "${event.account.name}" - ${event.account.date}`);
      });
    }
    
    // Token mint summary
    console.log("\n🪙 Token Mint Info:");
    console.log(`   💎 Each event has its own unique SPL Token`);
    console.log(`   🎫 Tickets = Tokens of that event's mint`);
    console.log(`   🔒 All mints have 0 decimals (whole tickets only)`);
    
    console.log("\n" + "═".repeat(90));
    console.log("🎉 SolTix Event Listing Complete!");
    
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
    
    if (error.message.includes("ANCHOR_PROVIDER_URL")) {
      console.log("💡 Environment variables issue. Make sure you're in the anchor-program directory.");
    } else if (error.message.includes("workspace")) {
      console.log("💡 Run this from the anchor-program directory: cd anchor-program && node scripts/list-events.js");
    } else {
      console.error("📋 Full error:", error);
    }
  }
}

// Add command line options
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log("📋 SolTix Event Lister");
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/list-events.js              # List all events");
  console.log("  node scripts/list-events.js --my         # List only your events");
  console.log("  node scripts/list-events.js --help       # Show this help");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/list-events.js");
  console.log("  node scripts/list-events.js --my");
  process.exit(0);
}

// Check if user wants only their events
if (args.includes('--my')) {
  // Modify the function to filter only user's events
  listAllEvents().then(() => {
    // This would be implemented to filter by current wallet
    console.log("\n💡 Showing all events for now. --my filter coming soon!");
  });
} else {
  listAllEvents();
}
