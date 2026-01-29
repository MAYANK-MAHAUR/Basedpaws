import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { Wallet, LogOut, Loader2 } from 'lucide-react'

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
            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {truncateAddress(address)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnect()}
                    className="gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Disconnect</span>
                </Button>
            </div>
        )
    }

    return (
        <Button
            onClick={() => connector && connect({ connector })}
            disabled={isPending || !connector}
            className="gap-2 rounded-full"
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                </>
            ) : (
                <>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                </>
            )}
        </Button>
    )
}
