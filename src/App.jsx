import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { config } from './lib/wagmi'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Navbar } from './components/Navbar'
import { Leaderboard } from './components/Leaderboard'
import { PhotoFeed } from './components/PhotoFeed'
import { ProfileSetup } from './components/ProfileSetup'
import { usePhotos } from './hooks/usePhotos'
import { useProfiles } from './hooks/useProfiles'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
    const { address, isConnected } = useAccount()
    const { photos, loading } = usePhotos()
    const { hasProfile, setProfile } = useProfiles()
    const [showSetup, setShowSetup] = useState(false)

    useEffect(() => {
        if (isConnected && address && !hasProfile(address)) {
            const timer = setTimeout(() => setShowSetup(true), 500)
            return () => clearTimeout(timer)
        }
    }, [isConnected, address, hasProfile])

    const handleProfileComplete = (profileData) => {
        setProfile(address, profileData)
        setShowSetup(false)
    }

    const handleProfileSkip = () => {
        setProfile(address, { name: '', avatar: '🐾', skipped: true })
        setShowSetup(false)
    }

    return (
        <div className="app">
            <Navbar />

            <main className="main-content">
                {/* Hero */}
                <header className="hero">
                    <h1 className="hero-title">
                        <span className="gradient-text">BasedPaws</span> 🐾
                    </h1>
                    <p className="hero-subtitle">
                        The funniest pet photos on Base • Vote • Win • Get Tips
                    </p>
                </header>

                {/* Monthly Leaderboard - Top 3 */}
                <Leaderboard photos={photos} />

                {/* Photo Feeds */}
                <PhotoFeed photos={photos} loading={loading} />
            </main>

            <footer className="footer">
                <p>Built with 💙 on <span className="base-logo">Base</span></p>
                <p className="footer-note">Free to use • Sign to vote • Win monthly 🏆</p>
            </footer>

            {showSetup && (
                <ProfileSetup
                    address={address}
                    onComplete={handleProfileComplete}
                    onSkip={handleProfileSkip}
                />
            )}
        </div>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <AppContent />
                </QueryClientProvider>
            </WagmiProvider>
        </ErrorBoundary>
    )
}

export default App
