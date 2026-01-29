import { useState } from 'react'

const AVATAR_OPTIONS = ['🐕', '🐈', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐔', '🐧', '🦋', '🦄']

export function ProfileSetup({ address, onComplete, onSkip }) {
    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('🐕')
    const [step, setStep] = useState(1)

    const handleComplete = () => {
        onComplete({
            name: name.trim() || `User${address.slice(2, 6)}`,
            avatar,
        })
    }

    return (
        <div className="modal-overlay">
            <div className="setup-modal">
                <div className="setup-header">
                    <span className="setup-emoji">🎉</span>
                    <h2>Welcome to BasedPaws!</h2>
                    <p>Let's set up your profile</p>
                </div>

                {step === 1 && (
                    <div className="setup-step">
                        <label className="setup-label">Choose your avatar</label>
                        <div className="avatar-grid">
                            {AVATAR_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
                                    onClick={() => setAvatar(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-primary btn-full" onClick={() => setStep(2)}>
                            Next →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="setup-step">
                        <div className="preview-avatar">{avatar}</div>
                        <label className="setup-label">What should we call you?</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                            autoFocus
                        />
                        <div className="setup-actions">
                            <button className="btn btn-outline" onClick={() => setStep(1)}>
                                ← Back
                            </button>
                            <button className="btn btn-primary" onClick={handleComplete}>
                                Complete Setup ✓
                            </button>
                        </div>
                    </div>
                )}

                <button className="setup-skip" onClick={onSkip}>
                    Skip for now
                </button>
            </div>
        </div>
    )
}
