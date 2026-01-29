import { useState } from 'react'
import { useAccount } from 'wagmi'
import { usePhotos } from '../hooks/usePhotos'
import { useVotes } from '../hooks/useVotes'
import { getIPFSUrl } from '../lib/ipfs'

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                    <div className="profile-avatar">🐾</div>
                    <div className="profile-info">
                        <h2>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anon'}</h2>
                        <div className="profile-stats">
                            <span><strong>{stats.uploads}</strong> uploads</span>
                            <span><strong>{stats.receivedVotes}</strong> votes</span>
                            <span><strong>{unlocked.length}</strong> badges</span>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} style={{ position: 'absolute', right: '1rem', top: '1rem' }}>✕</button>
                </div>

                <div className="profile-tabs">
                    <button className={`profile-tab ${tab === 'photos' ? 'active' : ''}`} onClick={() => setTab('photos')}>📸 My Photos</button>
                    <button className={`profile-tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>🏆 Achievements</button>
                </div>

                <div className="profile-content">
                    {tab === 'photos' && (
                        myPhotos.length === 0 ? (
                            <div className="empty-photos"><span>📷</span><p>No photos yet</p></div>
                        ) : (
                            <div className="my-photos-grid">
                                {myPhotos.map((photo) => {
                                    const timeLeft = getEditTimeLeft(photo.createdAt)
                                    return (
                                        <div key={photo.id} className="my-photo-item">
                                            <img src={photo.imageUrl || getIPFSUrl(photo.cid)} alt={photo.title} />
                                            <div className="my-photo-overlay">
                                                <h4>{photo.title}</h4>
                                                <div className="my-photo-meta">
                                                    <span>❤️ {getVoteCount(photo.id) || 0}</span>
                                                </div>
                                                <div className="my-photo-actions">
                                                    {timeLeft && <button className="btn btn-sm" onClick={() => { setEditing(photo); setEditTitle(photo.title) }}>✏️ Edit</button>}
                                                    <button className="btn btn-sm btn-danger" onClick={() => window.confirm('Delete?') && deletePhoto(photo.id)}>🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    )}

                    {tab === 'achievements' && (
                        <div className="achievements-grid">
                            {ACHIEVEMENTS.map((a) => (
                                <div key={a.id} className={`achievement-item ${a.check(stats) ? 'unlocked' : 'locked'}`}>
                                    <span className="achievement-icon">{a.icon}</span>
                                    <div className="achievement-info"><h4>{a.name}</h4><p>{a.desc}</p></div>
                                    {a.check(stats) && <span className="achievement-check">✓</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editing && (
                    <div className="edit-modal-overlay" onClick={() => setEditing(null)}>
                        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                            <h3>Edit Title</h3>
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="form-input" maxLength={100} />
                            <div className="edit-modal-actions">
                                <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={() => { updatePhoto(editing.id, { title: editTitle }); setEditing(null) }}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
