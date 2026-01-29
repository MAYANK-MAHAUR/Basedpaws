import { useState } from 'react'
import { useAccount } from 'wagmi'
import { usePhotos } from '../hooks/usePhotos'
import { useVotes } from '../hooks/useVotes'
import { getIPFSUrl } from '../lib/ipfs'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { X, Trophy, Edit, Trash2 } from 'lucide-react'

const getEditTimeLeft = (createdAt) => {
    const deadline = createdAt + 24 * 60 * 60 * 1000
    const left = deadline - Date.now()
    if (left <= 0) return null
    return `${Math.floor(left / 3600000)}h ${Math.floor((left % 3600000) / 60000)}m`
}

const ACHIEVEMENTS = [
    { id: 'first', icon: '📸', name: 'First Upload', desc: 'Upload your first photo', check: (s) => s.uploads >= 1 },
    { id: 'five', icon: '🌟', name: 'Rising Star', desc: 'Upload 5 photos', check: (s) => s.uploads >= 5 },
    { id: 'ten', icon: '🔥', name: 'On Fire', desc: 'Upload 10 photos', check: (s) => s.uploads >= 10 },
    { id: 'voter', icon: '❤️', name: 'Supporter', desc: 'Vote on a photo', check: (s) => s.votes >= 1 },
    { id: 'popular', icon: '🏆', name: 'Popular', desc: 'Get 5 votes', check: (s) => s.receivedVotes >= 5 },
    { id: 'viral', icon: '🚀', name: 'Viral', desc: 'Get 20 votes', check: (s) => s.receivedVotes >= 20 },
    { id: 'early', icon: '🌅', name: 'Early Adopter', desc: 'Join early', check: () => true },
]

export function MyProfile({ onClose }) {
    const { address } = useAccount()
    const { photos, deletePhoto, updatePhoto } = usePhotos()
    const { getVoteCount, getAllVotesCount } = useVotes()
    const [tab, setTab] = useState('photos')
    const [editing, setEditing] = useState(null)
    const [editTitle, setEditTitle] = useState('')

    const myPhotos = photos.filter((p) => p.ownerAddress === address)
    const stats = {
        uploads: myPhotos.length,
        votes: getAllVotesCount(address),
        receivedVotes: myPhotos.reduce((sum, p) => sum + (getVoteCount(p.id) || 0), 0),
    }
    const unlocked = ACHIEVEMENTS.filter((a) => a.check(stats))

    return (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl border shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b flex items-start justify-between bg-secondary/20">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">🐾</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anon'}</h2>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                <span><strong className="text-foreground">{stats.uploads}</strong> uploads</span>
                                <span><strong className="text-foreground">{stats.receivedVotes}</strong> votes</span>
                                <span><strong className="text-foreground">{unlocked.length}</strong> badges</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="size-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-muted/40 p-1">
                    <button
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'photos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setTab('photos')}
                    >
                        📸 My Photos
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'achievements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setTab('achievements')}
                    >
                        🏆 Achievements
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-secondary/10">
                    {tab === 'photos' && (
                        myPhotos.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <span className="text-4xl block mb-2">📷</span>
                                <p>No photos yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {myPhotos.map((photo) => {
                                    const timeLeft = getEditTimeLeft(photo.createdAt)
                                    return (
                                        <div key={photo.id} className="group relative rounded-lg overflow-hidden border shadow-sm aspect-square bg-black">
                                            <img src={photo.imageUrl || getIPFSUrl(photo.cid)} alt={photo.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <h4 className="text-white font-medium truncate text-sm">{photo.title}</h4>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-white/80">❤️ {getVoteCount(photo.id) || 0}</span>
                                                    <div className="flex gap-1">
                                                        {timeLeft && (
                                                            <button
                                                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
                                                                onClick={(e) => { e.stopPropagation(); setEditing(photo); setEditTitle(photo.title) }}
                                                                title={`Edit (${timeLeft} left)`}
                                                            >
                                                                <Edit className="size-3" />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded text-white"
                                                            onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete?')) deletePhoto(photo.id) }}
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    )}

                    {tab === 'achievements' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ACHIEVEMENTS.map((a) => {
                                const isUnlocked = a.check(stats)
                                return (
                                    <div key={a.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isUnlocked ? 'bg-card border-primary/20 shadow-sm' : 'bg-muted/50 border-transparent opacity-60'}`}>
                                        <div className="text-3xl">{a.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{a.name}</h4>
                                            <p className="text-xs text-muted-foreground">{a.desc}</p>
                                        </div>
                                        {isUnlocked && <div className="text-primary"><Trophy className="size-5 fill-current" /></div>}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {editing && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setEditing(null)}>
                        <div className="bg-card w-full max-w-sm p-6 rounded-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-bold">Edit Title</h3>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                maxLength={100}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                                <Button onClick={() => { updatePhoto(editing.id, { title: editTitle }); setEditing(null) }}>Save</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
