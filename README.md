# 🐾 BasedPaws

A fun, web3-native pet photo sharing platform built on Base.

> Share your funniest pet photos, upvote favorites, and tip creators with ETH!

![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

| Feature | Cost | Description |
|---------|------|-------------|
| 📸 Upload Photos | Free | Share your funny pet moments |
| ❤️ Upvote | Free | Vote for your favorites |
| 💰 Tip Creators | ~$0.001 gas | Send ETH tips to photo owners |
| 🔗 On-Chain | Verifiable | All tips recorded on Base |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173 in your browser.

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Use localStorage instead of IPFS (for local dev)
VITE_USE_MOCK_IPFS=true

# Contract address (optional, enables smart contract donations)
VITE_DONATION_CONTRACT_ADDRESS=0x...

# Network
VITE_CHAIN_ID=84532
```

### Deploy Smart Contract

See [DEPLOY.md](./DEPLOY.md) for contract deployment instructions.

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Wallet**: wagmi v2 + viem
- **Storage**: Web3.Storage (IPFS) or localStorage
- **Network**: Base / Base Sepolia
- **Styling**: Pure CSS (no frameworks)

## 📁 Project Structure

```
src/
├── components/      # React components
├── hooks/           # Custom React hooks
├── lib/             # Utilities & config
│   ├── wagmi.js     # Wallet configuration
│   ├── ipfs.js      # Storage helpers
│   └── contract.js  # Contract ABI
└── contracts/       # Solidity contracts
```

## 🎨 Features Breakdown

### Free Features (No Gas)
- Upload photos (stored in localStorage/IPFS)
- Upvote photos (localStorage)
- Browse gallery

### On-Chain Features (Tiny Gas)
- Tip creators with ETH
- All tips tracked on Base blockchain

## 📝 License

MIT License - Built for Base Grant
