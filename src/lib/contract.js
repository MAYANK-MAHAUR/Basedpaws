// PetDonation Contract ABI and Deployment Info
// Deploy using Remix IDE or Foundry

export const DONATION_CONTRACT_ADDRESS = import.meta.env.VITE_DONATION_CONTRACT_ADDRESS || null

// Minimal ABI for frontend interactions
export const DONATION_ABI = [
    // Register a photo
    {
        name: 'registerPhoto',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'photoId', type: 'uint256' }],
        outputs: [],
    },
    // Donate ETH
    {
        name: 'donateETH',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ name: 'photoId', type: 'uint256' }],
        outputs: [],
    },
    // Donate tokens
    {
        name: 'donateToken',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'photoId', type: 'uint256' },
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
    // Get photo info
    {
        name: 'getPhotoInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'photoId', type: 'uint256' }],
        outputs: [
            { name: 'owner', type: 'address' },
            { name: 'ethBalance', type: 'uint256' },
        ],
    },
    // Get total ETH donations
    {
        name: 'totalETHDonations',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    // Events
    {
        name: 'ETHDonated',
        type: 'event',
        inputs: [
            { name: 'photoId', type: 'uint256', indexed: true },
            { name: 'donor', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
    },
    {
        name: 'PhotoRegistered',
        type: 'event',
        inputs: [
            { name: 'photoId', type: 'uint256', indexed: true },
            { name: 'owner', type: 'address', indexed: true },
        ],
    },
]

// Base Sepolia testnet info
export const BASE_SEPOLIA = {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    faucet: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet',
}

// Base mainnet info
export const BASE_MAINNET = {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
}
