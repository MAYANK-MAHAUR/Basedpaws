import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const VOTES_KEY = 'basedpaws_votes'

// localStorage fallback functions
function getLocalVotes() {
    try {
        return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}')
    } catch {
        return {}
    }
}

function getLocalUserVotes() {
    try {
        return JSON.parse(localStorage.getItem(VOTES_KEY + '_user') || '{}')
    } catch {
        return {}
    }
}

function saveLocalVotes(votes, userVotes) {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
    localStorage.setItem(VOTES_KEY + '_user', JSON.stringify(userVotes))
}

export function useVotes() {
    const [votes, setVotes] = useState({}) // { photoId: voteCount }
    const [userVotes, setUserVotes] = useState({}) // { `${photoId}_${address}`: true }

    // Load votes
    useEffect(() => {
        async function loadVotes() {
            if (isSupabaseConfigured()) {
                // Load vote counts from photos table
                const { data: photos, error: photosError } = await supabase
                    .from('photos')
                    .select('id, votes')

                if (!photosError && photos) {
                    const voteMap = {}
                    photos.forEach(p => {
                        voteMap[p.id] = p.votes || 0
                    })
                    setVotes(voteMap)
                }

                // Load user votes from votes table
                const { data: votesData, error: votesError } = await supabase
                    .from('votes')
                    .select('photo_id, voter_address')

                if (!votesError && votesData) {
                    const userVoteMap = {}
                    votesData.forEach(v => {
                        userVoteMap[`${v.photo_id}_${v.voter_address}`] = true
                    })
                    setUserVotes(userVoteMap)
                }
            } else {
                setVotes(getLocalVotes())
                setUserVotes(getLocalUserVotes())
            }
        }

        loadVotes()

        // Subscribe to real-time changes
        if (isSupabaseConfigured()) {
            const subscription = supabase
                .channel('votes_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
                    loadVotes()
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'photos' }, () => {
                    loadVotes()
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }
    }, [])

    // Add a vote
    const addVote = useCallback(async (photoId, address) => {
        if (!address) return
        const voteKey = `${photoId}_${address}`
        if (userVotes[voteKey]) return // Already voted

        const currentVotes = votes[photoId] || 0
        const newVotes = { ...votes, [photoId]: currentVotes + 1 }
        const newUserVotes = { ...userVotes, [voteKey]: true }

        // Optimistically update UI
        setVotes(newVotes)
        setUserVotes(newUserVotes)

        if (isSupabaseConfigured()) {
            // Insert vote record
            const { error: voteError } = await supabase.from('votes').insert({
                photo_id: photoId,
                voter_address: address,
                created_at: new Date().toISOString(),
            })

            if (voteError) {
                console.error('Supabase vote insert error:', voteError)
                // Revert on error
                setVotes(votes)
                setUserVotes(userVotes)
                return
            }

            // Update photo vote count
            const { error: updateError } = await supabase
                .from('photos')
                .update({ votes: currentVotes + 1 })
                .eq('id', photoId)

            if (updateError) console.error('Supabase vote count update error:', updateError)
        } else {
            saveLocalVotes(newVotes, newUserVotes)
        }
    }, [votes, userVotes])

    // Remove a vote
    const removeVote = useCallback(async (photoId, address) => {
        if (!address) return
        const voteKey = `${photoId}_${address}`
        if (!userVotes[voteKey]) return // Hasn't voted

        const currentVotes = votes[photoId] || 0
        const newVotes = { ...votes, [photoId]: Math.max(0, currentVotes - 1) }
        const newUserVotes = { ...userVotes }
        delete newUserVotes[voteKey]

        // Optimistically update UI
        setVotes(newVotes)
        setUserVotes(newUserVotes)

        if (isSupabaseConfigured()) {
            // Delete vote record
            const { error: deleteError } = await supabase
                .from('votes')
                .delete()
                .eq('photo_id', photoId)
                .eq('voter_address', address)

            if (deleteError) {
                console.error('Supabase vote delete error:', deleteError)
                // Revert on error
                setVotes(votes)
                setUserVotes(userVotes)
                return
            }

            // Update photo vote count
            const { error: updateError } = await supabase
                .from('photos')
                .update({ votes: Math.max(0, currentVotes - 1) })
                .eq('id', photoId)

            if (updateError) console.error('Supabase vote count update error:', updateError)
        } else {
            saveLocalVotes(newVotes, newUserVotes)
        }
    }, [votes, userVotes])

    // Check if user has voted for a photo
    const hasVoted = useCallback((photoId, address) => {
        if (!address) return false
        return !!userVotes[`${photoId}_${address}`]
    }, [userVotes])

    // Get vote count for a photo
    const getVoteCount = useCallback((photoId) => {
        return votes[photoId] || 0
    }, [votes])

    // Get total votes by an address
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
