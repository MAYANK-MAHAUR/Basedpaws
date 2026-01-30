import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useComments } from '../hooks/useComments.jsx'
import { useProfiles } from '../hooks/useProfiles'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Loader2, Send, MessageCircle, Trash2 } from 'lucide-react'
import { Basename } from './Basename'

export function CommentsSection({ photoId }) {
    const { address, isConnected } = useAccount()
    const { loadComments, getComments, addComment, deleteComment } = useComments()
    const { getAvatar } = useProfiles()
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const commentsEndRef = useRef(null)

    const comments = getComments(photoId)

    // Load comments when component mounts
    useEffect(() => {
        if (!loaded) {
            loadComments(photoId)
            setLoaded(true)
        }
    }, [photoId, loadComments, loaded])

    // Scroll to bottom when new comments arrive
    useEffect(() => {
        if (commentsEndRef.current && comments.length > 0) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [comments.length])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newComment.trim() || !isConnected || submitting) return

        const commentText = newComment.trim()
        setNewComment('')
        setSubmitting(true)

        try {
            await addComment(photoId, address, commentText)
        } catch (error) {
            console.error('Failed to add comment:', error)
            setNewComment(commentText) // Restore on error
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (timestamp) => {
        const diff = Date.now() - timestamp
        if (diff < 60000) return 'now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div className="border rounded-xl p-3 bg-secondary/30">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Comments</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-[180px] overflow-y-auto mb-3 pr-1">
                {comments.length === 0 ? (
                    <div className="text-center text-muted-foreground text-xs py-3">
                        <p>No comments yet. Be the first!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2 group animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <Avatar className="size-6 shrink-0 border">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {getAvatar(comment.commenterAddress)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 bg-background/60 rounded-lg px-2.5 py-1.5">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-xs font-medium truncate max-w-[120px]">
                                        <Basename address={comment.commenterAddress} />
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatTime(comment.createdAt)}
                                    </span>
                                    {address?.toLowerCase() === comment.commenterAddress?.toLowerCase() && (
                                        <button
                                            onClick={() => deleteComment(photoId, comment.id)}
                                            className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm break-words leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Input */}
            {isConnected ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        maxLength={280}
                        disabled={submitting}
                        className="flex-1 h-8 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!newComment.trim() || submitting}
                        className="h-8 w-8 p-0"
                    >
                        {submitting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <Send className="size-3.5" />
                        )}
                    </Button>
                </form>
            ) : (
                <div className="text-center text-xs text-muted-foreground py-1">
                    Connect wallet to comment
                </div>
            )}
        </div>
    )
}
