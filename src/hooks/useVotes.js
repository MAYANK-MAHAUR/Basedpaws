import { useState, useEffect, useCallback } from 'react'

const VOTES_KEY = 'basedpaws_votes'
const PHOTOS_KEY = 'basedpaws_photos'

export function useVotes() {
    const [votes, setVotes] = useState({}) // { photoId: voteCount }
    const [userVotes, setUserVotes] = useState({}) // { `${photoId}_${address}`: true }

    // Load votes from localStorage
    useEffect(() => {
        const storedVotes = localStorage.getItem(VOTES_KEY)
        const storedUserVotes = localStorage.getItem(VOTES_KEY + '_user')

        if (storedVotes) {
            try {
                setVotes(JSON.parse(storedVotes))
            } catch (e) {
                console.error('Failed to parse votes:', e)
            }
        }

        if (storedUserVotes) {
            try {
                setUserVotes(JSON.parse(storedUserVotes))
            } catch (e) {
                console.error('Failed to parse user votes:', e)
            }
        }
    }, [])

    // Save votes
    const saveVotes = useCallback((newVotes, newUserVotes) => {
        localStorage.setItem(VOTES_KEY, JSON.stringify(newVotes))
        localStorage.setItem(VOTES_KEY + '_user', JSON.stringify(newUserVotes))
        setVotes(newVotes)
        setUserVotes(newUserVotes)

        // Also update the photos storage with new vote counts
        const photos = JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]')
        const updatedPhotos = photos.map(p => ({
            ...p,
            votes: newVotes[p.id] || 0
        }))
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos))
    }, [])

    // Add a vote (after signature verification)
    const addVote = useCallback((photoId, address) => {
        if (!address) return
        const voteKey = `${photoId}_${address}`
        if (userVotes[voteKey]) return // Already voted

        const currentVotes = votes[photoId] || 0
        const newVotes = { ...votes, [photoId]: currentVotes + 1 }
        const newUserVotes = { ...userVotes, [voteKey]: true }

        saveVotes(newVotes, newUserVotes)
    }, [votes, userVotes, saveVotes])

    // Remove a vote
    const removeVote = useCallback((photoId, address) => {
        if (!address) return
        const voteKey = `${photoId}_${address}`
        if (!userVotes[voteKey]) return // Hasn't voted

        const currentVotes = votes[photoId] || 0
        const newVotes = { ...votes, [photoId]: Math.max(0, currentVotes - 1) }
        const newUserVotes = { ...userVotes }
        delete newUserVotes[voteKey]

        saveVotes(newVotes, newUserVotes)
    }, [votes, userVotes, saveVotes])

    // Check if user has voted for a photo (address-based)
    const hasVoted = useCallback((photoId, address) => {
        if (!address) return false
        return !!userVotes[`${photoId}_${address}`]
    }, [userVotes])

    // Get vote count for a photo
    const getVoteCount = useCallback((photoId) => {
        return votes[photoId] || 0
    }, [votes])

    // Get total votes across all photos by an address
    const getAllVotesCount = useCallback((address) => {
        if (!address) return 0
        return Object.keys(userVotes).filter(key => key.endsWith(`_${address}`)).length
    }, [userVotes])

    return {
        votes,
        addVote,
        removeVote,
        hasVoted,
        getVoteCount,
        getAllVotesCount,
    }
}
