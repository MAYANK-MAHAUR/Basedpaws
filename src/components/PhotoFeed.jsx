import { useState } from 'react'
import { PhotoCard } from './PhotoCard'
import { useVotes } from '../hooks/useVotes'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

export function PhotoFeed({ photos, loading }) {
    const { getVoteCount } = useVotes()
    const [activeTab, setActiveTab] = useState('trending')

    if (loading) {
        return (
            <section className="py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading pets...</p>
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
        <section className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold tracking-tight">Recent Uploads</h2>
                    <p className="text-muted-foreground">Discover amazing pet photos from the community</p>
                </div>

                <div className="flex p-1 bg-secondary rounded-lg">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activePhotos.length === 0 ? (
                <div className="py-20 text-center bg-secondary/20 rounded-3xl border border-dashed border-border/60">
                    <span className="text-6xl mb-4 block">🐾</span>
                    <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
                    <p className="text-muted-foreground">Be the first to share a funny pet!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activePhotos.map(photo => (
                        <PhotoCard key={photo.id} photo={photo} />
                    ))}
                </div>
            )}

            <div className="text-center pt-8">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                    Load More
                </Button>
            </div>
        </section>
    )
}
