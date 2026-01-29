import { PhotoCard } from './PhotoCard'
import { useProfiles } from '../hooks/useProfiles'
import { useVotes } from '../hooks/useVotes'

export function Leaderboard({ photos }) {
    const { getDisplayName, getAvatar } = useProfiles()
    const { getVoteCount } = useVotes()

    // Get current month's photos
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    const thisMonthPhotos = photos
        .filter(p => p.createdAt >= monthStart)
        .map(p => ({ ...p, votes: getVoteCount(p.id) }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 3)

    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (thisMonthPhotos.length === 0) {
        return (
            <section className="leaderboard-section">
                <div className="section-header">
                    <h2>🏆 {monthName} Champions</h2>
                    <p>Top 3 most voted photos this month</p>
                </div>
                <div className="leaderboard-empty">
                    <span>🎯</span>
                    <p>Be the first to upload this month!</p>
                </div>
            </section>
        )
    }

    // Reorder for podium display: 2nd, 1st, 3rd
    const podiumOrder = thisMonthPhotos.length >= 3
        ? [thisMonthPhotos[1], thisMonthPhotos[0], thisMonthPhotos[2]]
        : thisMonthPhotos

    return (
        <section className="leaderboard-section">
            <div className="section-header">
                <h2>🏆 {monthName} Champions</h2>
                <p>Top 3 most voted photos this month</p>
            </div>

            <div className="podium">
                {podiumOrder.map((photo, idx) => {
                    const rank = thisMonthPhotos.indexOf(photo) + 1
                    const medals = ['🥇', '🥈', '🥉']

                    return (
                        <div key={photo.id} className={`podium-item rank-${rank}`}>
                            <div className="podium-medal">{medals[rank - 1]}</div>
                            <div className="podium-photo">
                                <img src={photo.imageUrl} alt={photo.title} />
                            </div>
                            <div className="podium-info">
                                <span className="podium-avatar">{getAvatar(photo.ownerAddress)}</span>
                                <span className="podium-name">{getDisplayName(photo.ownerAddress)}</span>
                            </div>
                            <div className="podium-votes">❤️ {photo.votes}</div>
                            <div className={`podium-stand stand-${rank}`}>{rank}</div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
