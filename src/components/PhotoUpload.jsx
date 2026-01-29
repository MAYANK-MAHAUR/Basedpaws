import { useState, useRef } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { uploadToIPFS } from '../lib/ipfs'
import { usePhotos } from '../hooks/usePhotos'
import { Button } from './ui/button'
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react'
import { triggerConfetti } from '../lib/confetti'

export function PhotoUpload({ onUploadComplete }) {
    const { isConnected, address } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const { addPhoto } = usePhotos()
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState(null)
    const [title, setTitle] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [signing, setSigning] = useState(false)
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

        try {
            // Step 1: Sign message to prove ownership
            setSigning(true)
            const message = `I'm uploading "${title.trim()}" to BasedPaws\n\nTimestamp: ${Date.now()}`
            await signMessageAsync({ message })
            setSigning(false)

            // Step 2: Upload to IPFS
            setUploading(true)
            const result = await uploadToIPFS(file)
            addPhoto({
                title: title.trim(),
                cid: result.cid,
                imageUrl: result.url || preview,
                ownerAddress: address
            })
            setSuccess(true)
            triggerConfetti()
            setTimeout(() => {
                setFile(null)
                setPreview(null)
                setTitle('')
                setSuccess(false)
                if (onUploadComplete) onUploadComplete()
            }, 1500)
        } catch (error) {
            console.error('Upload failed:', error)
            if (error.message?.includes('User rejected')) {
                // User cancelled signing
            } else {
                alert('Upload failed')
            }
        } finally {
            setSigning(false)
            setUploading(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                </div>
                <p className="text-muted-foreground">Connect wallet to upload photos</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Note: Title is rendered by parent modal usually, but if this is standalone: */}
            {/* <h2 className="text-xl font-bold">📸 Share Your Pet</h2> */}

            {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                    <span className="text-6xl mb-4">🎉</span>
                    <h3 className="text-xl font-bold text-primary mb-1">Uploaded!</h3>
                    <p className="text-muted-foreground">Your pet is now famous!</p>
                </div>
            ) : !preview ? (
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer active:scale-95 touch-manipulation ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="size-8" />
                    </div>
                    <p className="font-medium text-foreground mb-1">Tap to Upload Photo</p>
                    <p className="text-sm text-muted-foreground mb-4 hidden sm:block">or drag and drop here</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">Select Photo</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                            type="button"
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            onClick={() => { setFile(null); setPreview(null); setTitle('') }}
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Give your pet a funny title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxLength={100}
                        autoFocus
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={signing || uploading || !title.trim()}>
                        {signing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sign to Continue...</>
                        ) : uploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                        ) : (
                            <>🚀 Share Photo</>
                        )}
                    </Button>
                </form>
            )}
        </div>
    )
}
