import { useState } from 'react'
import { useAccount } from 'wagmi'
import { usePhotos } from '../hooks/usePhotos.jsx'
import { useVotes } from '../hooks/useVotes'
import { useProfiles } from '../hooks/useProfiles'
import { getIPFSUrl } from '../lib/ipfs'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { X, Trophy, Edit, Trash2, Settings } from 'lucide-react'
import { ProfileSetup } from './ProfileSetup'
import { Basename } from './Basename'

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
    const { getProfile, setProfile, getDisplayName } = useProfiles()
    const [tab, setTab] = useState('photos')
    const [editing, setEditing] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [userEditing, setUserEditing] = useState(false)

    const profile = getProfile(address)
    const myPhotos = photos.filter((p) => p.ownerAddress === address)
    const stats = {
        uploads: myPhotos.length,
        votes: getAllVotesCount(address),
        receivedVotes: myPhotos.reduce((sum, p) => sum + (getVoteCount(p.id) || 0), 0),
    }
    const unlocked = ACHIEVEMENTS.filter((a) => a.check(stats))

    if (userEditing) {
        return (
            <ProfileSetup
                address={address}
                onComplete={(data) => {
                    setProfile(address, data)
                    setUserEditing(false)
                }}
                onSkip={() => setUserEditing(false)}
            />
        )
    }

    return (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
            <div className="bg-card w-full h-[85vh] sm:h-[80vh] sm:max-w-2xl flex flex-col rounded-t-2xl sm:rounded-2xl border shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 sm:p-6 border-b flex items-start justify-between bg-secondary/20 relative">
                    <div className="w-12 h-1.5 bg-muted rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                        <Avatar className="size-12 sm:size-16 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                                {profile?.avatar?.length > 4 ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : profile?.avatar || '🐾'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-bold">
                                    <Basename address={address} />
                                </h2>
                                <button
                                    onClick={() => setUserEditing(true)}
                                    className="p-1 hover:bg-black/5 rounded-full text-muted-foreground hover:text-primary transition-colors"
                                    title="Edit Profile"
                                >
                                    <Settings className="size-4" />
                                </button>
                            </div>
                            <div className="flex gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
                                <span><strong className="text-foreground">{stats.uploads}</strong> uploads</span>
                                <span><strong className="text-foreground">{stats.receivedVotes}</strong> votes</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hidden sm:flex">
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
