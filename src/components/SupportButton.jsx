import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from './ui/button'
import { Heart, X, Loader2, CheckCircle } from 'lucide-react'

const DONATION_ADDRESS = '0xec4C55967878d9b3e03a7da39CEA05B5EDf1bDdE'
const PRESET_AMOUNTS = ['0.001', '0.005', '0.01']

export function SupportButton() {
    const [showModal, setShowModal] = useState(false)
    const [amount, setAmount] = useState('0.001')
    const { isConnected } = useAccount()

    const { data: hash, isPending, sendTransaction } = useSendTransaction()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const handleDonate = () => {
        sendTransaction({
            to: DONATION_ADDRESS,
            value: parseEther(amount),
        })
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2 text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
                onClick={() => setShowModal(true)}
            >
                <Heart className="size-4" />
                Support
            </Button>

            {showModal && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm overflow-y-auto"
                    onClick={() => setShowModal(false)}
                >
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div className="bg-card w-full max-w-sm rounded-xl border shadow-lg p-6 animate-in zoom-in-95 duration-300 text-left" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Heart className="size-5 text-pink-500" />
                                    Support BasedPaws
                                </h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                    <X className="size-4" />
                                </Button>
                            </div>

                            {isSuccess ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold mb-2">Thank You! 💙</h4>
                                    <p className="text-muted-foreground text-sm">Your support keeps BasedPaws running!</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Help us keep the servers running and add new features! Every little bit helps. 🐾
                                    </p>

                                    <div className="flex gap-2 mb-3">
                                        {PRESET_AMOUNTS.map((preset) => (
                                            <Button
                                                key={preset}
                                                variant={amount === preset ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setAmount(preset)}
                                            >
                                                {preset} ETH
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-xs text-muted-foreground mb-1 block">Custom amount</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="0.001"
                                                min="0.0001"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="0.001"
                                            />
                                            <span className="text-sm text-muted-foreground">ETH</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full gap-2"
                                        size="lg"
                                        onClick={handleDonate}
                                        disabled={!isConnected || isPending || isConfirming}
                                    >
                                        {isPending || isConfirming ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                {isPending ? 'Confirming...' : 'Processing...'}
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="size-4" />
                                                Donate {amount} ETH
                                            </>
                                        )}
                                    </Button>

                                    {!isConnected && (
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Connect wallet to donate
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

