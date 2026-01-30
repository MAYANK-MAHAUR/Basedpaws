import { useProfiles } from '../hooks/useProfiles'
import { useVotes } from '../hooks/useVotes.jsx'
import { Card } from './ui/card'
import { Medal, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Basename } from './Basename'

export function Leaderboard({ photos }) {
    const { getDisplayName, getAvatar } = useProfiles()
    const { getVoteCount } = useVotes()

    // Get current month's photos
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    const thisMonthPhotos = photos
        .filter(p => p.createdAt >= monthStart)
        .map(p => ({
            ...p,
            votes: getVoteCount(p.id),
            // Mock tips for visual if not real, or use real if available
            tips: p.donations || 0
        }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 3)

    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const medalsConfig = {
        1: { bg: 'from-yellow-600 to-yellow-500', border: 'border-yellow-400', icon: '🥇' },
        2: { bg: 'from-gray-400 to-gray-300', border: 'border-gray-200', icon: '🥈' },
        3: { bg: 'from-orange-600 to-orange-500', border: 'border-orange-400', icon: '🥉' },
    }

    if (thisMonthPhotos.length === 0) {
        return (
            <section className="py-12 sm:py-20 px-2 sm:px-4 bg-secondary/30 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4">
                <div className="max-w-6xl mx-auto text-center space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <Medal className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">This Month</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">🏆 {monthName} Champions</h2>
                    <div className="py-8 sm:py-12 flex flex-col items-center gap-4 text-muted-foreground">
                        <span className="text-5xl sm:text-6xl">🎯</span>
                        <p className="text-base sm:text-lg">Be the first to upload this month!</p>
                    </div>
                </div>
            </section>
        )
    }

    // Reorder for podium display: 2nd, 1st, 3rd if we have enough
    const hasEnough = thisMonthPhotos.length >= 3;
    // Map to rank first
    const rankedPhotos = thisMonthPhotos.map((p, i) => ({ ...p, rank: i + 1 }));

    // Sort logic for visual podium (2, 1, 3) or just list
    const orderedPhotos = hasEnough
        ? [rankedPhotos[1], rankedPhotos[0], rankedPhotos[2]]
        : rankedPhotos;

    return (
        <section className="py-12 sm:py-20 px-2 sm:px-4 bg-secondary/30 rounded-2xl sm:rounded-3xl mx-2 sm:mx-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 sm:mb-12 text-center space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <Medal className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">This Month</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground">Top Pets of {monthName}</h2>
                    <p className="text-muted-foreground text-sm sm:text-lg">The most loved and tipped pets on Base</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
                    {orderedPhotos.map((photo) => {
                        const medal = medalsConfig[photo.rank] || medalsConfig[3] // Fallback
                        const isFirst = photo.rank === 1

                        return (
                            <div
                                key={photo.id}
                                className={`relative group ${isFirst ? 'md:col-span-1 md:-mt-12 order-first md:order-none z-10' : ''
                                    }`}
                            >
                                {isFirst && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                )}

                                <Card className={`relative overflow-hidden backdrop-blur-sm border transition-all hover:border-primary/50 ${isFirst
                                    ? 'bg-gradient-to-br from-yellow-900/10 to-transparent border-yellow-400/30'
                                    : 'bg-card'
                                    }`}>
                                    {/* Medal Badge */}
                                    <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 text-2xl sm:text-4xl flex items-center justify-center opacity-80">
                                        {medal.icon}
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        {/* Rank Circle */}
                                        <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${medal.bg} border-2 ${medal.border} text-white font-bold text-sm sm:text-lg mb-3 sm:mb-4 shadow-md`}>
                                            #{photo.rank}
                                        </div>

                                        {/* Image */}
                                        <div className="w-full aspect-square rounded-lg sm:rounded-xl bg-muted overflow-hidden mb-3 sm:mb-4 border border-border/50 shadow-inner">
                                            <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Info */}
                                        <h3 className="text-base sm:text-xl font-bold text-foreground mb-1 truncate">{photo.title}</h3>
                                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                            <Avatar className="size-5 sm:size-6">
                                                <AvatarFallback className="text-[8px] sm:text-[10px]">{getAvatar(photo.ownerAddress)}</AvatarFallback>
                                            </Avatar>
                                            <Basename address={photo.ownerAddress} className="text-xs sm:text-sm text-muted-foreground truncate" />
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-1 sm:space-y-2">
                                            <div className="flex justify-between items-center py-1.5 sm:py-2 border-t border-border/50 pt-2">
                                                <span className="text-muted-foreground text-xs sm:text-sm">Votes</span>
                                                <span className="flex items-center gap-1 text-primary font-semibold text-sm sm:text-base">
                                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    {photo.votes}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-1.5 sm:py-2">
                                                <span className="text-muted-foreground text-xs sm:text-sm">Total Tips</span>
                                                <span className="text-foreground font-semibold text-sm sm:text-base">{photo.tips.toFixed(4)} ETH</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
