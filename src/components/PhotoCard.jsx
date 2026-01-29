import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { getIPFSUrl } from '../lib/ipfs'
import { DonateModal } from './DonateModal'
import { useVotes } from '../hooks/useVotes'
import { useProfiles } from '../hooks/useProfiles'

export function PhotoCard({ photo }) {
    const { address, isConnected } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const { getVoteCount, hasVoted, addVote, removeVote } = useVotes()
    const { getDisplayName, getAvatar } = useProfiles()
    const [showDonate, setShowDonate] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [signing, setSigning] = useState(false)

    const votes = getVoteCount(photo.id)
    const voted = hasVoted(photo.id, address)
    const uploaderName = getDisplayName(photo.ownerAddress)
    const uploaderAvatar = getAvatar(photo.ownerAddress)

    const formatDate = (timestamp) => {
        const diff = Date.now() - timestamp
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleVote = async () => {
        if (!isConnected || !address) return

        setSigning(true)
        try {
            if (voted) {
                removeVote(photo.id, address)
            } else {
                const message = `I vote for "${photo.title}" on BasedPaws\n\nPhoto ID: ${photo.id}\nTimestamp: ${Date.now()}`
                await signMessageAsync({ message })
                addVote(photo.id, address)
            }
        } catch (error) {
            console.error('Vote failed:', error)
        } finally {
            setSigning(false)
        }
    }

    const imageUrl = photo.imageUrl || getIPFSUrl(photo.cid)

    return (
        <>
            <div className="photo-card">
                {/* Uploader Profile Badge */}
                <div className="uploader-badge" onClick={() => setShowDetails(true)}>
                    <div className="uploader-avatar">{uploaderAvatar}</div>
                </div>

                <div className="photo-image-container" onClick={() => setShowDetails(true)}>
                    {!imageError ? (
                        <img
                            src={imageUrl}
                            alt={photo.title}
                            className="photo-image"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="photo-placeholder">
                            <span>🐾</span>
                            <p>Image not available</p>
                        </div>
                    )}
                </div>

                <div className="photo-content">
                    <h3 className="photo-title">{photo.title}</h3>
                    <div className="photo-meta">
                        <span className="photo-uploader">by {uploaderName}</span>
                        <span>{formatDate(photo.createdAt)}</span>
                    </div>
                </div>

                <div className="photo-actions">
                    <button
                        className={`btn-vote ${voted ? 'voted' : ''} ${signing ? 'signing' : ''}`}
                        onClick={handleVote}
                        disabled={!isConnected || signing}
                    >
                        {signing ? (
                            <>
                                <span className="spinner" style={{ width: 14, height: 14 }}></span>
                                <span>Signing...</span>
                            </>
                        ) : (
                            <>
                                <span>{voted ? '❤️' : '🤍'}</span>
                                <span>{votes}</span>
                            </>
                        )}
                    </button>

                    <button
                        className="btn-donate"
                        onClick={() => setShowDonate(true)}
                        disabled={!isConnected}
                    >
                        <span>🎁</span> Tip
                    </button>
                </div>
            </div>

            {/* Photo Details Modal */}
            {showDetails && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="photo-details-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowDetails(false)}>✕</button>

                        <div className="details-image">
                            <img src={imageUrl} alt={photo.title} />
                        </div>

                        <div className="details-content">
                            <h2>{photo.title}</h2>

                            <div className="uploader-info">
                                <div className="uploader-avatar-large">{uploaderAvatar}</div>
                                <div className="uploader-details">
                                    <span className="uploader-label">Uploaded by</span>
                                    <span className="uploader-address">{uploaderName}</span>
                                </div>
                            </div>

                            <div className="details-stats">
                                <div className="detail-stat">
                                    <span className="detail-value">❤️ {votes}</span>
                                    <span className="detail-label">Votes</span>
                                </div>
                                <div className="detail-stat">
                                    <span className="detail-value">📅 {formatDate(photo.createdAt)}</span>
                                    <span className="detail-label">Uploaded</span>
                                </div>
                                {photo.donations > 0 && (
                                    <div className="detail-stat">
                                        <span className="detail-value">💰 {photo.donations.toFixed(4)}</span>
                                        <span className="detail-label">ETH Tips</span>
                                    </div>
                                )}
                            </div>

                            <div className="details-actions">
                                <button
                                    className={`btn btn-lg ${voted ? 'btn-outline' : 'btn-primary'}`}
                                    onClick={handleVote}
                                    disabled={!isConnected || signing}
                                >
                                    {signing ? 'Signing...' : voted ? '❤️ Voted' : '🤍 Vote'}
                                </button>
                                <button
                                    className="btn btn-lg"
                                    style={{ background: 'var(--gradient-fire)', color: 'white' }}
                                    onClick={() => { setShowDetails(false); setShowDonate(true) }}
                                    disabled={!isConnected}
                                >
                                    🎁 Send Tip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDonate && (
                <DonateModal photo={photo} onClose={() => setShowDonate(false)} />
            )}
        </>
    )
}
