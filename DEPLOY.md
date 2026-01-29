# 🚀 Deploying BasedPaws

## Step 0: Set Up Pinata IPFS (FREE - No Card!)

1. **Sign up**: https://app.pinata.cloud/register (just email)
2. **Create API Key**: https://app.pinata.cloud/developers/api-keys
   - Click "New Key"
   - Enable "pinFileToIPFS"
   - Copy the JWT token
3. **Add to `.env.local`**:
   ```
   VITE_PINATA_JWT=your_jwt_token_here
   ```

> 💡 The app works without Pinata too (uses localStorage), but Pinata makes images permanent!

---

## Step 1: Deploy Smart Contract

## Option 1: Remix IDE (Easiest)

### Step 1: Get Base Sepolia ETH

Choose one of these working faucets:

| Faucet | Amount | Link |
|--------|--------|------|
| **Alchemy** | 0.1 ETH/day | https://www.alchemy.com/faucets/base-sepolia |
| **Chainlink** | 0.5 ETH | https://faucets.chain.link/base-sepolia |
| **Thirdweb** | 0.01 ETH/day | https://thirdweb.com/base-sepolia-testnet |
| **LearnWeb3** | 0.01 ETH/day | https://learnweb3.io/faucets/base_sepolia |


### Step 2: Deploy Contract
1. Go to: https://remix.ethereum.org
2. Create new file: `PetDonation.sol`
3. Copy the contract code from `src/contracts/PetDonation.sol`
4. Note: You'll also need OpenZeppelin contracts. In Remix, they auto-download.

### Step 3: Compile
1. Go to "Solidity Compiler" tab
2. Select compiler version: `0.8.19`
3. Click "Compile PetDonation.sol"

### Step 4: Deploy
1. Go to "Deploy & Run" tab
2. Environment: "Injected Provider - MetaMask"
3. Make sure MetaMask is on **Base Sepolia** network
4. Click "Deploy"
5. Confirm in MetaMask

### Step 5: Save Contract Address
1. Copy the deployed contract address
2. Add to your `.env.local`:
```
VITE_DONATION_CONTRACT_ADDRESS=0x...your-address...
```

---

## Option 2: Foundry (Advanced)

### Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Create Foundry Project
```bash
cd d:\base
forge init contracts --no-commit
cd contracts
```

### Install OpenZeppelin
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### Copy Contract
```bash
copy ..\src\contracts\PetDonation.sol src\PetDonation.sol
```

### Create Remappings
```bash
echo @openzeppelin/=lib/openzeppelin-contracts/ > remappings.txt
```

### Deploy
```bash
forge create --rpc-url https://sepolia.base.org \
  --private-key YOUR_PRIVATE_KEY \
  src/PetDonation.sol:PetDonation
```

---

## Verify Contract (Optional)

After deployment, verify on BaseScan:

```bash
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.19 \
  YOUR_CONTRACT_ADDRESS \
  src/PetDonation.sol:PetDonation
```

---

## Network Details

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Base Sepolia | 84532 | https://sepolia.base.org |
| Base Mainnet | 8453 | https://mainnet.base.org |
