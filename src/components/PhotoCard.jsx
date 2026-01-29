import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { getIPFSUrl } from '../lib/ipfs'
import { DonateModal } from './DonateModal'
import { useVotes } from '../hooks/useVotes'
import { useProfiles } from '../hooks/useProfiles'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Heart, Gift, Loader2, X, MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'

export function PhotoCard({ photo }) {
    const { address, isConnected } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const { getVoteCount, hasVoted, addVote, removeVote } = useVotes()
    const { getDisplayName, getAvatar } = useProfiles()
    const [showDonate, setShowDonate] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [signing, setSigning] = useState(false)

    const votes = getVoteCount(photo.id)
    const voted = hasVoted(photo.id, address)
    const uploaderName = getDisplayName(photo.ownerAddress)
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
            }
        } catch (error) {
            console.error('Vote failed:', error)
        } finally {
            setSigning(false)
        }
    }

    const imageUrl = photo.imageUrl || getIPFSUrl(photo.cid)

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group border-border/60" onClick={() => setShowDetails(true)}>
                <div className="relative aspect-square bg-secondary/20">
                    {!imageError ? (
                        <img
                            src={imageUrl}
                            alt={photo.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
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
                        <span className="truncate max-w-[100px]">{uploaderName}</span>
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
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
                    <div className="bg-card w-full max-w-4xl h-[80vh] md:h-auto md:aspect-video rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button Mob */}
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 md:hidden z-10 bg-black/20 text-white" onClick={() => setShowDetails(false)}>
                            <X className="size-5" />
                        </Button>

                        {/* Image Side */}
                        <div className="relative w-full md:w-3/5 bg-black flex items-center justify-center">
                            <img src={imageUrl} alt={photo.title} className="max-h-full max-w-full object-contain" />
                        </div>

                        {/* Info Side */}
                        <div className="flex-1 flex flex-col p-6 md:p-8 bg-card relative">
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 hidden md:flex" onClick={() => setShowDetails(false)}>
                                <X className="size-5" />
                            </Button>

                            <div className="flex items-center gap-3 mb-6">
                                <Avatar className="size-10 border">
                                    <AvatarFallback className="bg-primary/10 text-primary">{uploaderAvatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Uploaded by</p>
                                    <p className="font-semibold">{uploaderName}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <h2 className="text-2xl font-bold mb-2">{photo.title}</h2>
                                <p className="text-muted-foreground text-sm mb-6">Posted {formatDate(photo.createdAt)}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-secondary/50 border">
                                        <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
                                        <p className="text-2xl font-bold flex items-center gap-2">
                                            {votes} <Heart className="size-5 text-red-500 fill-red-500" />
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-secondary/50 border">
                                        <p className="text-sm text-muted-foreground mb-1">Tips Earned</p>
                                        <p className="text-2xl font-bold flex items-center gap-2">
                                            {photo.donations ? photo.donations.toFixed(4) : 0} <span className="text-base text-primary">ETH</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t space-y-3">
                                <Button
                                    size="lg"
                                    className={cn("w-full gap-2", voted && "bg-red-500 hover:bg-red-600")}
                                    onClick={handleVote}
                                    disabled={!isConnected || signing}
                                >
                                    {signing ? <Loader2 className="size-5 animate-spin" /> : <Heart className={cn("size-5", voted && "fill-current")} />}
                                    {voted ? "Voted" : "Vote for this pet"}
                                </Button>
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
