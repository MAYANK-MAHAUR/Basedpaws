import { useState, useEffect, useRef } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { getIPFSUrl } from '../lib/ipfs'
import { DonateModal } from './DonateModal'
import { useVotes } from '../hooks/useVotes.jsx'
import { useProfiles } from '../hooks/useProfiles'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Heart, Gift, Loader2, X, Share2, Download, Copy, Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { Basename } from './Basename'
import { triggerConfetti } from '../lib/confetti'
import { generateOGImage, downloadOGImage, copyOGImageToClipboard } from '../lib/ogImage'
import { CommentsSection } from './CommentsSection'

export function PhotoCard({ photo }) {
    const { address, isConnected } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const { getVoteCount, hasVoted, addVote, removeVote } = useVotes()
    const { getDisplayName, getAvatar } = useProfiles()
    const [showDonate, setShowDonate] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [signing, setSigning] = useState(false)
    const [copied, setCopied] = useState(false)
    const shareMenuRef = useRef(null)

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
                setShowShareMenu(false)
            }
        }
        if (showShareMenu) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showShareMenu])

    const votes = getVoteCount(photo.id)
    const voted = hasVoted(photo.id, address)
    const uploaderAvatar = getAvatar(photo.ownerAddress)

    const formatDate = (timestamp) => {
        const diff = Date.now() - timestamp
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleVote = async (e) => {
        e.stopPropagation();
        if (!isConnected || !address) return

        setSigning(true)
        try {
            if (voted) {
                removeVote(photo.id, address)
            } else {
                const message = `I vote for "${photo.title}" on BasedPaws\n\nPhoto ID: ${photo.id}\nTimestamp: ${Date.now()}`
                await signMessageAsync({ message })
                addVote(photo.id, address)
                triggerConfetti() // 🎉
            }
        } catch (error) {
            console.error('Vote failed:', error)
        } finally {
            setSigning(false)
        }
    }

    const handleShare = (e) => {
        e.stopPropagation()
        const text = `Check out "${photo.title}" on BasedPaws! 🐾\n\n❤️ ${votes} votes\n\n#BasedPaws @base`

        const shareImageUrl = photo.imageUrl || getIPFSUrl(photo.cid)
        let url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`

        // Only embed valid public image URLs
        // Filter out data: (too large), blob: (local only), and localhost (not public)
        const isValidEmbed = shareImageUrl &&
            !shareImageUrl.startsWith('data:') &&
            !shareImageUrl.startsWith('blob:') &&
            !shareImageUrl.includes('localhost') &&
            !shareImageUrl.includes('127.0.0.1');

        if (isValidEmbed) {
            url += `&embeds[]=${encodeURIComponent(shareImageUrl)}`
        }

        window.open(url, '_blank')
    }

    const handleCopyOG = async (e) => {
        e.stopPropagation()
        const photoWithVotes = { ...photo, votes }
        const success = await copyOGImageToClipboard(photoWithVotes)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownloadOG = async (e) => {
        e.stopPropagation()
        const photoWithVotes = { ...photo, votes }
        await downloadOGImage(photoWithVotes, `${photo.title.replace(/\s+/g, '-')}-basedpaws.png`)
    }

    const imageUrl = photo.imageUrl || getIPFSUrl(photo.cid)
    const [imageLoading, setImageLoading] = useState(true)

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group border-border/60" onClick={() => setShowDetails(true)}>
                <div className="relative aspect-square bg-secondary/20">
                    {/* Skeleton loader */}
                    {imageLoading && !imageError && (
                        <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
                            <span className="text-4xl opacity-30">🐾</span>
                        </div>
                    )}
                    {!imageError ? (
                        <img
                            src={imageUrl}
                            alt={photo.title}
                            className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => { setImageError(true); setImageLoading(false) }}
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                            <span className="text-4xl mb-2">🐾</span>
                            <p className="text-sm">Image unavailable</p>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                        <Avatar className="size-5">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{uploaderAvatar}</AvatarFallback>
                        </Avatar>
                        <Basename address={photo.ownerAddress} className="truncate max-w-[100px]" />
                    </div>
                </div>

                <CardContent className="p-4">
                    <h3 className="font-semibold truncate mb-1">{photo.title}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(photo.createdAt)}</p>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                    <Button
                        variant={voted ? "default" : "secondary"}
                        size="sm"
                        className={cn("flex-1 gap-1.5", voted && "bg-red-500 hover:bg-red-600 text-white")}
                        onClick={handleVote}
                        disabled={!isConnected || signing}
                    >
                        {signing ? <Loader2 className="size-3 animate-spin" /> : <Heart className={cn("size-3.5", voted && "fill-current")} />}
                        {votes}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setShowDonate(true); }}
                        disabled={!isConnected}
                    >
                        <Gift className="size-3.5" />
                        Tip
                    </Button>
                </CardFooter>
            </Card>

            {/* Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowDetails(false)}>
                    <div className="bg-card w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-4xl sm:aspect-video rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden flex flex-col sm:flex-row" onClick={(e) => e.stopPropagation()}>
                        {/* Mobile drag handle */}
                        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-2 sm:hidden shrink-0" />

                        {/* Close Button Mob */}
                        <Button variant="ghost" size="icon" className="absolute top-3 right-3 sm:hidden z-10 bg-black/40 text-white hover:bg-black/60" onClick={() => setShowDetails(false)}>
                            <X className="size-5" />
                        </Button>

                        {/* Image Side */}
                        <div className="relative w-full h-[40%] sm:h-auto sm:w-3/5 bg-black flex items-center justify-center shrink-0">
                            <img src={imageUrl} alt={photo.title} className="max-h-full max-w-full object-contain" />
                        </div>

                        {/* Info Side */}
                        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 bg-card relative overflow-hidden">
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 hidden sm:flex" onClick={() => setShowDetails(false)}>
                                <X className="size-5" />
                            </Button>

                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <Avatar className="size-8 sm:size-10 border">
                                    <AvatarFallback className="bg-primary/10 text-primary">{uploaderAvatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Uploaded by</p>
                                    <p className="font-semibold text-sm sm:text-base"><Basename address={photo.ownerAddress} /></p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0">
                                <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{photo.title}</h2>
                                <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">Posted {formatDate(photo.createdAt)}</p>

                                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 border">
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Votes</p>
                                        <p className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                                            {votes} <Heart className="size-4 sm:size-5 text-red-500 fill-red-500" />
                                        </p>
                                    </div>
                                    <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 border">
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Tips Earned</p>
                                        <p className="text-lg sm:text-2xl font-bold flex items-center gap-1 sm:gap-2">
                                            {photo.donations ? photo.donations.toFixed(4) : 0} <span className="text-sm sm:text-base text-primary">ETH</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="mt-4">
                                    <CommentsSection photoId={photo.id} />
                                </div>
                            </div>

                            <div className="pt-4 sm:pt-6 border-t space-y-2 sm:space-y-3 shrink-0">
                                <div className="flex gap-2 sm:gap-3">
                                    <Button
                                        size="lg"
                                        className={cn("flex-[2] gap-2", voted && "bg-red-500 hover:bg-red-600")}
                                        onClick={handleVote}
                                        disabled={!isConnected || signing}
                                    >
                                        {signing ? <Loader2 className="size-5 animate-spin" /> : <Heart className={cn("size-5", voted && "fill-current")} />}
                                        {voted ? "Voted" : "Vote"}
                                    </Button>

                                    {/* Share Menu */}
                                    <div ref={shareMenuRef} className="relative flex-1">
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="w-full gap-2"
                                            onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu) }}
                                        >
                                            <Share2 className="size-5" />
                                            Share
                                        </Button>

                                        {showShareMenu && (
                                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-lg shadow-lg overflow-hidden z-10 animate-in slide-in-from-bottom-2 duration-200">
                                                <button
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-secondary flex items-center gap-3 transition-colors"
                                                    onClick={handleShare}
                                                >
                                                    <Share2 className="size-4 text-primary" />
                                                    Cast on Warpcast
                                                </button>
                                                <button
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-secondary flex items-center gap-3 transition-colors border-t"
                                                    onClick={handleCopyOG}
                                                >
                                                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4 text-muted-foreground" />}
                                                    {copied ? 'Copied!' : 'Copy Share Image'}
                                                </button>
                                                <button
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-secondary flex items-center gap-3 transition-colors border-t"
                                                    onClick={handleDownloadOG}
                                                >
                                                    <Download className="size-4 text-muted-foreground" />
                                                    Download Share Image
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full gap-2"
                                    onClick={() => { setShowDetails(false); setShowDonate(true); }}
                                    disabled={!isConnected}
                                >
                                    <Gift className="size-5" />
                                    Send a Tip
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDonate && (
                <DonateModal photo={photo} onClose={() => setShowDonate(false)} />
            )}
        </>
    )
}
