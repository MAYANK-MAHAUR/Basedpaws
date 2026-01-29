import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './ui/button'
import { uploadToIPFS } from '../lib/ipfs'
import { Loader2, Upload, X } from 'lucide-react'

const AVATAR_OPTIONS = ['🐕', '🐈', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐔', '🐧', '🦋', '🦄']

export function ProfileSetup({ address, onComplete, onSkip }) {
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('🐕')
    const [isCustomAvatar, setIsCustomAvatar] = useState(false)
    const [step, setStep] = useState(1)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const handleComplete = () => {
        onComplete({
            name: name.trim() || `User${address.slice(2, 6)}`,
            avatar,
        })
    }

    const handleFile = async (f) => {
        if (!f.type.startsWith('image/')) return alert('Please select an image')
        setUploading(true)
        try {
            const result = await uploadToIPFS(f)
            setAvatar(result.url)
            setIsCustomAvatar(true)
        } catch (err) {
            console.error(err)
            alert('Avatar upload failed')
        } finally {
            setUploading(false)
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl p-6 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2 mb-8">
                    <span className="text-4xl animate-bounce inline-block">🎉</span>
                    <h2 className="text-2xl font-bold">Welcome to BasedPaws!</h2>
                    <p className="text-muted-foreground">Let's set up your profile</p>
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <label className="text-sm font-medium mb-4 block">Choose your avatar</label>

                            {/* Current Selection Preview */}
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-primary/20 flex items-center justify-center overflow-hidden bg-secondary">
                                {isCustomAvatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl">{avatar}</span>
                                )}
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {AVATAR_OPTIONS.slice(0, 8).map((emoji) => (
                                    <button
                                        key={emoji}
                                        className={`aspect-square rounded-xl hover:bg-secondary flex items-center justify-center text-2xl transition-all ${avatar === emoji ? 'bg-primary/20 ring-2 ring-primary relative' : ''}`}
                                        onClick={() => { setAvatar(emoji); setIsCustomAvatar(false) }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-black px-2 text-muted-foreground z-10 relative">Or Upload Custom</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                                />
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="animate-spin size-4" /> : <Upload className="size-4" />}
                                    Upload Image
                                </Button>
                            </div>
                        </div>

                        <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                            Next →
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-border flex items-center justify-center overflow-hidden bg-muted">
                                {isCustomAvatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">{avatar}</span>
                                )}
                            </div>
                            <label className="text-sm font-medium">What should we call you?</label>
                        </div>

                        <input
                            type="text"
                            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                ← Back
                            </Button>
                            <Button className="flex-[2]" onClick={handleComplete}>
                                Complete Setup ✓
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button className="text-xs text-muted-foreground hover:text-foreground hover:underline" onClick={onSkip}>
                        Skip for now
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
