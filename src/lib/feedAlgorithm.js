/**
 * Feed Algorithm - Smart ranking for photos
 * Calculates scores based on engagement, recency, velocity, and quality
 */

/**
 * Calculate feed score for a photo
 * Higher score = shown higher in feed
 * 
 * @param {Object} photo - Photo object with votes, createdAt, qualityScore
 * @param {number} impressions - Number of views (for engagement rate)
 * @returns {number} Score from 0-100
 */
export function calculateFeedScore(photo, impressions = 1) {
    const votes = photo.votes || 0
    const age = Date.now() - photo.createdAt
    const hoursAge = age / 3600000

    // 1. Engagement Rate (0-40 points)
    // Ratio of votes to impressions, capped at 1
    const engagementRate = Math.min(votes / Math.max(impressions, 1), 1)
    const engagementScore = engagementRate * 40

    // 2. Time Decay (0-30 points)
    // Full points for new posts, decays to 10% over 48 hours
    const timeDecay = Math.max(0.1, 1 - (hoursAge / 48) * 0.9)
    const timeScore = timeDecay * 30

    // 3. Viral Velocity (0-20 points)
    // How fast is it getting votes? (votes per hour, capped at 10)
    const velocity = hoursAge > 0.1 ? Math.min(votes / hoursAge, 10) : votes
    const velocityScore = (velocity / 10) * 20

    // 4. Quality Boost (0-10 points)
    // From image quality analysis
    const qualityBoost = (photo.qualityScore || 0.5) * 10

    return Math.round(engagementScore + timeScore + velocityScore + qualityBoost)
}

/**
 * Sort photos by feed algorithm
 * @param {Array} photos - Array of photo objects
 * @param {Object} impressionsMap - Map of photoId -> impression count
 * @returns {Array} Sorted photos with scores
 */
export function sortByFeedScore(photos, impressionsMap = {}) {
    return photos
        .map(photo => ({
            ...photo,
            feedScore: calculateFeedScore(photo, impressionsMap[photo.id] || 1)
        }))
        .sort((a, b) => b.feedScore - a.feedScore)
}

/**
 * Apply diversity filter to prevent same owner appearing consecutively
 * @param {Array} photos - Sorted photos array
 * @param {number} maxConsecutive - Max photos from same owner in a row
 * @returns {Array} Diversified photos array
 */
export function applyDiversity(photos, maxConsecutive = 1) {
    if (photos.length <= 2) return photos

    const result = []
    const pending = [...photos]
    const ownerCounts = {}

    while (pending.length > 0) {
        // Find next photo that doesn't exceed consecutive limit
        let found = false

        for (let i = 0; i < pending.length; i++) {
            const photo = pending[i]
            const owner = photo.ownerAddress

            // Check last N items in result for same owner
            const recentSameOwner = result
                .slice(-maxConsecutive)
                .filter(p => p.ownerAddress === owner).length

            if (recentSameOwner < maxConsecutive) {
                result.push(photo)
                pending.splice(i, 1)
                found = true
                break
            }
        }

        // If no suitable photo found, just add the next one
        if (!found && pending.length > 0) {
            result.push(pending.shift())
        }
    }

    return result
}

/**
 * Get trending photos (high velocity, recent)
 */
export function getTrending(photos, limit = 12) {
    const now = Date.now()
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

    return photos
        .filter(p => p.createdAt > twentyFourHoursAgo)
        .map(p => {
            const hoursAge = Math.max((now - p.createdAt) / 3600000, 0.1)
            const velocity = (p.votes || 0) / hoursAge
            return { ...p, velocity }
        })
        .sort((a, b) => b.velocity - a.velocity)
        .slice(0, limit)
}

/**
 * Get top voted photos (all time or period)
 */
export function getTopVoted(photos, options = {}) {
    const { limit = 12, period = null } = options

    let filtered = [...photos]

    if (period) {
        const cutoff = Date.now() - period
        filtered = filtered.filter(p => p.createdAt > cutoff)
    }

    return filtered
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, limit)
}

/**
 * Get recent photos
 */
export function getRecent(photos, limit = 12) {
    return [...photos]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
}

/**
 * Calculate photo statistics
 */
export function getPhotoStats(photos) {
    const total = photos.length
    const totalVotes = photos.reduce((sum, p) => sum + (p.votes || 0), 0)
    const totalDonations = photos.reduce((sum, p) => sum + (p.donations || 0), 0)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const thisMonth = photos.filter(p => p.createdAt >= monthStart).length

    const uniqueOwners = new Set(photos.map(p => p.ownerAddress)).size

    return {
        total,
        totalVotes,
        totalDonations: totalDonations.toFixed(4),
        thisMonth,
        uniqueOwners,
        avgVotes: total > 0 ? (totalVotes / total).toFixed(1) : 0
    }
}
