import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { Wallet, LogOut, Loader2, X, ChevronRight } from 'lucide-react'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()
    const [showModal, setShowModal] = useState(false)

    const truncateAddress = (addr) => {
        if (!addr) return ''
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const handleConnect = (connector) => {
        connect({ connector })
        setShowModal(false)
    }

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
        <>
            <Button
                onClick={() => setShowModal(true)}
                disabled={isPending}
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

            {/* Wallet Selection Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-xl border shadow-lg relative overflow-hidden flex flex-col max-h-[70vh] sm:max-h-[600px] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 pb-2 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold">Connect Wallet</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-muted-foreground text-sm">Choose how you want to connect.</p>
                        </div>

                        <div className="p-4 space-y-2 overflow-y-auto">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => handleConnect(connector)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-secondary transition-colors group text-left shrink-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                                            {connector.id.includes('coinbase') ? '🔵' : '🦊'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-semibold truncate">
                                                {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {connector.id.includes('coinbase')
                                                    ? 'Best for mobile'
                                                    : 'MetaMask, Rainbow, etc.'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-secondary/20 border-t text-center text-xs text-muted-foreground">
                            New to wallets? <a href="https://www.coinbase.com/wallet" target="_blank" rel="noreferrer" className="text-primary hover:underline">Get one here</a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
