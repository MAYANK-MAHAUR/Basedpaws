import { useState } from 'react'
import { PhotoCard } from './PhotoCard'
import { useVotes } from '../hooks/useVotes.jsx'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { sortByFeedScore, applyDiversity, getTrending, getTopVoted, getRecent } from '../lib/feedAlgorithm'

export function PhotoFeed({ photos, loading }) {
    const { getVoteCount } = useVotes()
    const [activeTab, setActiveTab] = useState('for-you')

    if (loading) {
        return (
            <section className="py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading pets...</p>
            </section>
        )
    }

    // Enrich photos with vote counts
    const enrichedPhotos = photos.map(p => ({
        ...p,
        votes: getVoteCount(p.id)
    }))

    // Apply smart feed algorithm
    const algorithmFeed = applyDiversity(sortByFeedScore(enrichedPhotos), 2).slice(0, 12)
    const trendingPhotos = getTrending(enrichedPhotos, 12)
    const recentPhotos = getRecent(enrichedPhotos, 12)
    const topPhotos = getTopVoted(enrichedPhotos, { limit: 12 })

    const tabs = [
        { id: 'for-you', label: '✨ For You', photos: algorithmFeed },
        { id: 'trending', label: '🔥 Trending', photos: trendingPhotos },
        { id: 'recent', label: '🆕 Recent', photos: recentPhotos },
        { id: 'top', label: '⭐ Top Voted', photos: topPhotos },
    ]

    const activePhotos = tabs.find(t => t.id === activeTab)?.photos || []

    return (
        <section className="space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4">
                <div className="space-y-1 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Recent Uploads</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Discover amazing pet photos from the community</p>
                </div>

                <div className="flex p-1 bg-secondary rounded-lg overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
