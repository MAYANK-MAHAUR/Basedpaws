import { useState, useRef } from 'react'
import { useAccount } from 'wagmi'
import { uploadToIPFS } from '../lib/ipfs'
import { usePhotos } from '../hooks/usePhotos'

function createConfetti() {
    const colors = ['#FF6B9D', '#8B5CF6', '#0052FF', '#FFD700', '#00D4AA']
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;'
    document.body.appendChild(container)
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div')
        confetti.style.cssText = `position:absolute;width:${Math.random() * 10 + 5}px;height:${Math.random() * 10 + 5}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}%;top:-20px;border-radius:${Math.random() > 0.5 ? '50%' : '0'};animation:confetti-fall ${Math.random() * 2 + 2}s ease-out forwards;`
        container.appendChild(confetti)
    }
    setTimeout(() => container.remove(), 4000)
}

export function PhotoUpload({ onUploadComplete }) {
    const { isConnected, address } = useAccount()
    const { addPhoto } = usePhotos()
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState(null)
    const [title, setTitle] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef(null)

    const handleFile = (f) => {
        if (!f.type.startsWith('image/')) return alert('Please select an image')
        setFile(f)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(f)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file || !title.trim()) return
        setUploading(true)
        try {
            const result = await uploadToIPFS(file)
            addPhoto({
                title: title.trim(),
                cid: result.cid,
                imageUrl: result.url || preview,
                ownerAddress: address
            })
            setSuccess(true)
            createConfetti()
            setTimeout(() => {
                setFile(null)
                setPreview(null)
                setTitle('')
                setSuccess(false)
                if (onUploadComplete) onUploadComplete()
            }, 1500)
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="upload-content">
                <div className="upload-locked">
                    <span className="lock-icon">🔒</span>
                    <p>Connect wallet to upload</p>
                </div>
            </div>
        )
    }

    return (
        <div className="upload-content">
            <h2 className="upload-title">📸 Share Your Pet</h2>
            {success ? (
                <div className="upload-success-state">
                    <span className="success-emoji">🎉</span>
                    <h3>Uploaded!</h3>
                    <p>Your pet is now famous!</p>
                </div>
            ) : !preview ? (
                <div
                    className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <span className="dropzone-icon">🐕</span>
                    <p className="dropzone-text">Drop your pet photo here</p>
                    <p className="dropzone-subtext">or click to browse</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="preview-container">
                        <img src={preview} alt="Preview" className="upload-preview" />
                        <button type="button" className="preview-clear" onClick={() => { setFile(null); setPreview(null); setTitle('') }}>✕</button>
                    </div>
                    <input type="text" placeholder="Give your pet a funny title..." value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" maxLength={100} autoFocus />
                    <button type="submit" className="btn btn-primary btn-full" disabled={uploading || !title.trim()}>
                        {uploading ? (<><span className="spinner"></span>Uploading...</>) : (<>🚀 Share</>)}
                    </button>
                </form>
            )}
        </div>
    )
}
