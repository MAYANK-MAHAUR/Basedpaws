import { useState, useEffect } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { base } from 'wagmi/chains'
import { usePhotos } from '../hooks/usePhotos'
import { Button } from './ui/button'
import { X, Loader2, Gift, AlertCircle } from 'lucide-react'

const PRESET_AMOUNTS = ['0.001', '0.005', '0.01', '0.05']

export function DonateModal({ photo, onClose }) {
    const { address, isConnected, chain } = useAccount()
    const { switchChain } = useSwitchChain()
    const { updateDonations } = usePhotos()
    const [amount, setAmount] = useState('0.005')
    const [customAmount, setCustomAmount] = useState('')
    const [error, setError] = useState('')

    const { data: hash, sendTransaction, isPending, error: txError } = useSendTransaction()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const finalAmount = customAmount || amount
    const isBase = chain?.id === base.id

    // Check for txError from hook
    useEffect(() => {
        if (txError) {
            setError(txError.shortMessage || txError.message || 'Transaction failed')
        }
    }, [txError])

    const handleDonate = async () => {
        if (!photo.ownerAddress) {
            setError('Error: This photo has no wallet address attached.')
            return
        }

        if (!isBase) {
            switchChain({ chainId: base.id })
            return
        }

        setError('')
        try {
            sendTransaction({
                to: photo.ownerAddress,
                value: parseEther(finalAmount),
            })
        } catch (err) {
            console.error(err)
            setError(err.message || 'Transaction failed')
        }
    }

    // Handle post-transaction success
    useEffect(() => {
        if (isSuccess) {
            updateDonations(photo.id, parseFloat(finalAmount))
            const timer = setTimeout(onClose, 2000)
            return () => clearTimeout(timer)
        }
    }, [isSuccess])

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
            <div className="bg-card w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl border shadow-lg relative p-6 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 sm:hidden" />
                <Button variant="ghost" size="icon" className="absolute right-2 top-2 hidden sm:flex" onClick={onClose}>
                    <X className="size-4" />
                </Button>

                <div className="text-center space-y-2 mb-6">
                    <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mb-2">
                        <Gift className="size-8" />
                    </div>
                    <h3 className="text-xl font-bold">Tip Creator</h3>
                    <p className="text-sm text-muted-foreground">Support this pet's owner with ETH</p>
                </div>

                <div className="space-y-4">
                    {isSuccess ? (
                        <div className="text-center py-8 space-y-2">
                            <span className="text-4xl block animate-bounce">🎉</span>
                            <h3 className="font-bold text-lg">Tip Sent!</h3>
                            <p className="text-muted-foreground">{finalAmount} ETH sent to creator</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_AMOUNTS.map((preset) => (
                                    <button
                                        key={preset}
                                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors border ${amount === preset && !customAmount
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background hover:bg-secondary border-input'
                                            }`}
                                        onClick={() => { setAmount(preset); setCustomAmount('') }}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    placeholder="Custom amount..."
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">ETH</span>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 text-xs font-medium">
                                    <AlertCircle className="size-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {!photo.ownerAddress ? (
                                <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                                    This photo has no address linked 😔
                                </div>
                            ) : (
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={handleDonate}
                                    disabled={!isConnected || isPending || isConfirming}
                                >
                                    {isPending || isConfirming ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isConfirming ? 'Confirming...' : 'Sending...'}</>
                                    ) : !isBase ? (
                                        'Switch to Base to Tip'
                                    ) : (
                                        <>Send {finalAmount} ETH</>
                                    )}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
