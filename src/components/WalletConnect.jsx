import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    const truncateAddress = (addr) => {
        if (!addr) return ''
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    // Use the first available connector (usually MetaMask/injected)
    const connector = connectors[0]

    if (isConnected) {
        return (
            <div className="wallet-connected">
                <div className="wallet-address">
                    <span className="address-dot"></span>
                    {truncateAddress(address)}
                </div>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => disconnect()}
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <button
            className="btn btn-primary"
            onClick={() => connector && connect({ connector })}
            disabled={isPending || !connector}
        >
            {isPending ? (
                <>
                    <span className="spinner"></span>
                    Connecting...
                </>
            ) : (
                <>
                    <span>🔗</span>
                    Connect Wallet
                </>
            )}
        </button>
    )
}
