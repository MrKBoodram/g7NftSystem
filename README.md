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

### Next Steps

- [x] Issue #2: Implement create_event instruction
- [x] Issue #3: Implement mint_ticket instruction
- Issue #5: Wallet connection UI
- Issue #6-11: Feature-specific components
