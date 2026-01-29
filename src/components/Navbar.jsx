import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnect } from './WalletConnect'
import { MyProfile } from './MyProfile'
import { PhotoUpload } from './PhotoUpload'

export function Navbar() {
    const { isConnected } = useAccount()
    const [showProfile, setShowProfile] = useState(false)
    const [showUpload, setShowUpload] = useState(false)

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <span className="logo-icon">🐾</span>
                    <span className="logo-text">BasedPaws</span>
                </div>
                <div className="navbar-actions">
                    {isConnected && (
                        <>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowUpload(true)}
                            >
                                📸 Upload
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowProfile(true)}
                            >
                                👤 Profile
                            </button>
                        </>
                    )}
                    <WalletConnect />
                </div>
            </nav>

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowUpload(false)}>✕</button>
                        <PhotoUpload onUploadComplete={() => setShowUpload(false)} />
                    </div>
                </div>
            )}

            {showProfile && (
                <MyProfile onClose={() => setShowProfile(false)} />
            )}
        </>
    )
}
