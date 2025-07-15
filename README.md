# SolTix - Solana Event Ticketing System

A decentralized event ticketing system built on Solana using SPL tokens.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Rust
- Solana CLI
- Anchor CLI

### Installation

```bash
# Clone and setup
git clone https://github.com/MrKBoodram/g7NftSystem
cd g7NftSystem

# Install dependencies
npm run install-all

# Setup Solana
solana config set --url devnet
solana-keygen new
solana airdrop 2

# Build and deploy program
npm run build-program
npm run deploy-program

# Start frontend
npm run dev-frontend
```

## 📁 Project Structure

```
soltix/
├── anchor-program/          # Solana program
│   ├── programs/
│   ├── tests/
│   └── Anchor.toml
├── frontend/                # Next.js frontend
│   ├── src/
│   └── package.json
└── README.md
```

## 🏗️ Development Workflow

1. **Program Lead**: Implement smart contract logic in `anchor-program/`
2. **Frontend Team**: Build UI components in `frontend/src/`
3. **Integration**: Connect frontend to deployed program

## 🎯 Key Features

- **Event Creation**: Organizers create events with unique SPL tokens
- **Ticket Minting**: Users mint tickets as tokens to their wallets
- **QR Verification**: Scan QR codes to verify ticket ownership
- **Fraud Prevention**: Cryptographically secure and verifiable

## 🛠️ Available Scripts

- `npm run build-program` - Build Anchor program
- `npm run deploy-program` - Deploy to devnet
- `npm run test-program` - Run program tests
- `npm run dev-frontend` - Start frontend development server

## 📋 Team Tasks

### Issue #1 ✅ - Anchor Project Setup (DONE)

- [x] Event account structure
- [x] Basic program instructions
- [x] SPL token integration

### Issue #4 ✅ - Frontend Setup (DONE)

- [x] Next.js with JavaScript
- [x] Wallet adapter integration
- [x] Basic UI structure

### Issue #5 & #6 ✅ - Create Event Page (DONE)

- [x] Able to enter event info (name, date)
- [x] Subitting will make call to contract's create_event instruction

### Issue #7 ✅ -  View all events (DONE)

- [x] On page load show all events created with contract
- [x] mock out mint button that will trigger minting ticket for event

### Issue #8 ✅ -  Mint event's ticket (DONE)

- [x] clicking mint will call contract's mint_ticket instruction

### Next Steps

- Issue #9-11: Feature-specific components


# CLI scripts

## create an event

Execute the following command:
```
cd anchor-program
node scripts/create-event.js "Encode solana bootcamp" "2024-07-01" 
```

The result should be similar: 
```
🎫 Creating event: "Encode solana bootcamp" on 2024-07-01
👤 Organizer: 7kimE1HfzKk4abxCodufXK7Y2HxUfAx2YCBmxWEjfLap
📋 Program ID: 5M5gc4khWwyba2iz9bAmUV2j9SaG5ki1BFvV1tsnoEQg
📍 Event PDA: EnjEvhRnc3Y3brbudW1DMm66eH9HgUPxWEtXmB45u21j
🪙 Token Mint PDA: 6rp2uyWFgKVmMZ1wcFqy4HteSNYkR6o7i7TMkxGFT8oW
💰 Balance: 2.29 SOL
🚀 Sending transaction...
✅ Event created successfully!
📋 Transaction: jTzd47BSPQoYKpWjLByQB6oZKhFXvjRPPz6fcvhzpDMf19qG4p43h4evUeXt3QyRxpyuuvFmTW7r91KcvPvQGsq
🔗 Explorer: https://explorer.solana.com/tx/jTzd47BSPQoYKpWjLByQB6oZKhFXvjRPPz6fcvhzpDMf19qG4p43h4evUeXt3QyRxpyuuvFmTW7r91KcvPvQGsq?cluster=devnet
🎫 Event Explorer: https://explorer.solana.com/address/EnjEvhRnc3Y3brbudW1DMm66eH9HgUPxWEtXmB45u21j?cluster=devnet

📊 Event Details:
Name: "Encode solana bootcamp"
Date: 2024-07-01
Organizer: 7kimE1HfzKk4abxCodufXK7Y2HxUfAx2YCBmxWEjfLap
Token Mint: 6rp2uyWFgKVmMZ1wcFqy4HteSNYkR6o7i7TMkxGFT8oW
```

## list events
Execute the following command:
```
cd anchor-program
node scripts/list-events.js           
```
The result should be something like: 
```
🔍 Fetching all SolTix events...

📋 Program ID: 5M5gc4khWwyba2iz9bAmUV2j9SaG5ki1BFvV1tsnoEQg
🌐 Network: Devnet
👤 Current Wallet: 7kimE1HfzKk4abxCodufXK7Y2HxUfAx2YCBmxWEjfLap

✅ Found 3 event(s):

══════════════════════════════════════════════════════════════════════════════════════════
🎫 Event #1:
📅 Name: "Summer Festival"
📆 Date: 2024-08-15
👤 Organizer: 7kimE1HfzKk4abxCodufXK7Y2HxUfAx2YCBmxWEjfLap
🪙 Token Mint: qj7kzEwTSrX9mWAmGzVrPQqn4WZspRiUzKVyXUx3eLW
📍 Event PDA: BHhNQCuA5v7tSyX92TiDCg852NCKuomLCEh3njGDnLHn
🔗 Event Explorer: https://explorer.solana.com/address/BHhNQCuA5v7tSyX92TiDCg852NCKuomLCEh3njGDnLHn?cluster=devnet
🎨 Token Explorer: https://explorer.solana.com/address/qj7kzEwTSrX9mWAmGzVrPQqn4WZspRiUzKVyXUx3eLW?cluster=devnet
👑 You are the organizer of this event
─────────────────────────────────────────────────────────────────────────────────────
🎫 Event #2:
📅 Name: "Encode solana bootcamp"
📆 Date: 2024-07-01
👤 Organizer: 7kimE1HfzKk4abxCodufXK7Y2HxUfAx2YCBmxWEjfLap
🪙 Token Mint: 6rp2uyWFgKVmMZ1wcFqy4HteSNYkR6o7i7TMkxGFT8oW
📍 Event PDA: EnjEvhRnc3Y3brbudW1DMm66eH9HgUPxWEtXmB45u21j
🔗 Event Explorer: https://explorer.solana.com/address/EnjEvhRnc3Y3brbudW1DMm66eH9HgUPxWEtXmB45u21j?cluster=devnet
🎨 Token Explorer: https://explorer.solana.com/address/6rp2uyWFgKVmMZ1wcFqy4HteSNYkR6o7i7TMkxGFT8oW?cluster=devnet
👑 You are the organizer of this event
....
```
