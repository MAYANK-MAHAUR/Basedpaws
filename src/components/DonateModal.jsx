import { useState } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { usePhotos } from '../hooks/usePhotos'

const PRESET_AMOUNTS = ['0.001', '0.005', '0.01', '0.05']

export function DonateModal({ photo, onClose }) {
    const { isConnected } = useAccount()
    const { updateDonations } = usePhotos()
    const [amount, setAmount] = useState('0.005')
    const [customAmount, setCustomAmount] = useState('')
    const [error, setError] = useState('')

    const { data: hash, sendTransaction, isPending } = useSendTransaction()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const finalAmount = customAmount || amount

    const handleDonate = async () => {
        if (!photo.ownerAddress) {
            setError('Photo owner address not found')
            return
        }
        setError('')
        try {
            sendTransaction({
                to: photo.ownerAddress,
                value: parseEther(finalAmount),
            })
        } catch (err) {
            setError(err.message || 'Transaction failed')
        }
    }

    if (isSuccess) {
        updateDonations(photo.id, parseFloat(finalAmount))
        setTimeout(onClose, 2000)
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">🎁 Tip Creator</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    {isSuccess ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h3>Tip Sent!</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{finalAmount} ETH sent to creator</p>
                        </div>
                    ) : (
                        <>
                            <div className="amount-presets">
                                {PRESET_AMOUNTS.map((preset) => (
                                    <button
                                        key={preset}
                                        className={`preset-btn ${amount === preset && !customAmount ? 'active' : ''}`}
                                        onClick={() => { setAmount(preset); setCustomAmount('') }}
                                    >
                                        {preset} ETH
                                    </button>
                                ))}
                            </div>
                            <div className="custom-amount">
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    placeholder="Custom amount..."
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            <button
                                className="btn btn-primary btn-full btn-lg"
                                onClick={handleDonate}
                                disabled={!isConnected || isPending || isConfirming}
                            >
                                {isPending || isConfirming ? (
                                    <><span className="spinner"></span>{isConfirming ? 'Confirming...' : 'Sending...'}</>
                                ) : (
                                    <>Send {finalAmount} ETH</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
