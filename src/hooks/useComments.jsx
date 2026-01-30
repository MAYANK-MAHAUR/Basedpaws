import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const CommentsContext = createContext(null)

const COMMENTS_KEY = 'basedpaws_comments'

// localStorage fallback
function getLocalComments() {
    try {
        return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}')
    } catch {
        return {}
    }
}

function saveLocalComments(comments) {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
}

export function CommentsProvider({ children }) {
    const [comments, setComments] = useState({}) // { photoId: [comment, ...] }
    const pendingCommentsRef = useRef(new Set()) // Track pending comment IDs to prevent duplicates

    // Load comments for a photo
    const loadComments = useCallback(async (photoId) => {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('photo_id', photoId)
                .order('created_at', { ascending: true })

            if (!error && data) {
                setComments(prev => ({
                    ...prev,
                    [photoId]: data.map(c => ({
                        id: c.id,
                        photoId: c.photo_id,
                        commenterAddress: c.commenter_address,
                        content: c.content,
                        createdAt: new Date(c.created_at).getTime(),
                    }))
                }))
            }
        } else {
            const local = getLocalComments()
            if (local[photoId]) {
                setComments(prev => ({ ...prev, [photoId]: local[photoId] }))
            }
        }
    }, [])

    // Subscribe to real-time comment updates
    useEffect(() => {
        if (isSupabaseConfigured()) {
            const subscription = supabase
                .channel('comments_realtime')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
                    const newComment = {
                        id: payload.new.id,
                        photoId: payload.new.photo_id,
                        commenterAddress: payload.new.commenter_address,
                        content: payload.new.content,
                        createdAt: new Date(payload.new.created_at).getTime(),
                    }

                    // Only add if not already in the list (prevents duplicates from optimistic update)
                    setComments(prev => {
                        const existing = prev[newComment.photoId] || []
                        // Check if comment with this ID already exists
                        if (existing.some(c => c.id === newComment.id)) {
                            return prev
                        }
                        // Check if this is a pending optimistic comment (by content + address match)
                        const pendingMatch = existing.find(c =>
                            typeof c.id === 'number' && c.id > 1000000000000 && // Temp ID (timestamp)
                            c.content === newComment.content &&
                            c.commenterAddress === newComment.commenterAddress
                        )
                        if (pendingMatch) {
                            // Replace temp comment with real one
                            return {
                                ...prev,
                                [newComment.photoId]: existing.map(c =>
                                    c.id === pendingMatch.id ? newComment : c
                                )
                            }
                        }
                        return {
                            ...prev,
                            [newComment.photoId]: [...existing, newComment]
                        }
                    })
                })
                .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, (payload) => {
                    const photoId = payload.old.photo_id
                    setComments(prev => ({
                        ...prev,
                        [photoId]: (prev[photoId] || []).filter(c => c.id !== payload.old.id)
                    }))
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }
    }, [])

    // Add a comment
    const addComment = useCallback(async (photoId, commenterAddress, content) => {
        if (!commenterAddress || !content.trim()) return null

        const tempId = Date.now() // Temporary ID for optimistic update
        const newComment = {
            id: tempId,
            photoId,
            commenterAddress,
            content: content.trim(),
            createdAt: Date.now(),
        }

        // Optimistically update UI
        setComments(prev => ({
            ...prev,
            [photoId]: [...(prev[photoId] || []), newComment]
        }))

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    photo_id: photoId,
                    commenter_address: commenterAddress,
                    content: content.trim(),
                    created_at: new Date().toISOString(),
                })
                .select()
                .single()

            if (error) {
                console.error('Supabase comment insert error:', error)
                // Revert on error
                setComments(prev => ({
                    ...prev,
                    [photoId]: (prev[photoId] || []).filter(c => c.id !== tempId)
                }))
                return null
            }

            // Real-time subscription will handle updating the temp ID to real ID
            return data
        } else {
            const local = getLocalComments()
            local[photoId] = [...(local[photoId] || []), newComment]
            saveLocalComments(local)
            return newComment
        }
    }, [])

    // Delete a comment
    const deleteComment = useCallback(async (photoId, commentId) => {
        setComments(prev => ({
            ...prev,
            [photoId]: (prev[photoId] || []).filter(c => c.id !== commentId)
        }))

        if (isSupabaseConfigured()) {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId)

            if (error) {
                console.error('Supabase comment delete error:', error)
            }
        } else {
            const local = getLocalComments()
            local[photoId] = (local[photoId] || []).filter(c => c.id !== commentId)
            saveLocalComments(local)
        }
    }, [])

    // Get comments for a photo
    const getComments = useCallback((photoId) => {
        return comments[photoId] || []
    }, [comments])

    // Get comment count for a photo
    const getCommentCount = useCallback((photoId) => {
        return (comments[photoId] || []).length
    }, [comments])

    const value = {
        comments,
        loadComments,
        addComment,
        deleteComment,
        getComments,
        getCommentCount,
    }

    return (
        <CommentsContext.Provider value={value}>
            {children}
        </CommentsContext.Provider>
    )
}

export function useComments() {
    const context = useContext(CommentsContext)
    if (!context) {
        throw new Error('useComments must be used within a CommentsProvider')
    }
    return context
}
