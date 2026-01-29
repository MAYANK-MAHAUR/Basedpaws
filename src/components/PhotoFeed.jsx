import { useState } from 'react'
import { PhotoCard } from './PhotoCard'
import { useVotes } from '../hooks/useVotes'

export function PhotoFeed({ photos, loading }) {
    const { getVoteCount } = useVotes()
    const [activeTab, setActiveTab] = useState('trending')

    if (loading) {
        return (
            <section className="feed-section">
                <div className="feed-loading">
                    <div className="spinner" style={{ width: 32, height: 32 }}></div>
                    <p>Loading pets...</p>
                </div>
            </section>
        )
    }

    // Calculate trending score (votes + recency boost)
    const withScores = photos.map(p => {
        const votes = getVoteCount(p.id)
        const hoursAge = (Date.now() - p.createdAt) / 3600000
        const recencyBoost = Math.max(0, 10 - hoursAge / 6) // Boost for first 60 hours
        return { ...p, votes, score: votes + recencyBoost }
    })

    // Get different feeds
    const trendingPhotos = [...withScores].sort((a, b) => b.score - a.score).slice(0, 12)
    const recentPhotos = [...photos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12)
    const topPhotos = [...withScores].sort((a, b) => b.votes - a.votes).slice(0, 12)

    const tabs = [
        { id: 'trending', label: '🔥 Trending', photos: trendingPhotos },
        { id: 'recent', label: '🆕 Recent', photos: recentPhotos },
        { id: 'top', label: '⭐ Top Voted', photos: topPhotos },
    ]

    const activePhotos = tabs.find(t => t.id === activeTab)?.photos || []

    return (
        <section className="feed-section">
            <div className="feed-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activePhotos.length === 0 ? (
                <div className="feed-empty">
                    <span>🐾</span>
                    <h3>No photos yet</h3>
                    <p>Be the first to share a funny pet!</p>
                </div>
            ) : (
                <div className="photo-grid">
                    {activePhotos.map(photo => (
                        <PhotoCard key={photo.id} photo={photo} />
                    ))}
                </div>
            )}
        </section>
    )
}
