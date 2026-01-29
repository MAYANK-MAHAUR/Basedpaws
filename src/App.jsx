import { useState, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { sdk } from '@farcaster/miniapp-sdk'
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

import { Hero } from './components/Hero'

function AppContent() {
    const { address, isConnected } = useAccount()
    const { photos, loading } = usePhotos()
    const { hasProfile, setProfile } = useProfiles()
    const [showSetup, setShowSetup] = useState(false)

    useEffect(() => {
        sdk.actions.ready();
    }, []);

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
        setProfile(address, {
            name: `User${address.slice(2, 6)}`,
            avatar: '🐾',
            skipped: true
        })
        setShowSetup(false)
    }

    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            <Navbar />

            <main>
                <Hero />

                <div className="container mx-auto px-4 py-12 space-y-24">
                    <div id="leaderboard" className="scroll-mt-24">
                        <Leaderboard photos={photos} />
                    </div>

                    <div id="feed" className="scroll-mt-24">
                        <PhotoFeed photos={photos} loading={loading} />
                    </div>
                </div>
            </main>

            <footer className="border-t py-12 bg-secondary/20">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <p className="font-semibold">Built with 💙 on <span className="text-primary">Base</span></p>
                    <p className="text-sm text-muted-foreground">Free to use • Sign to vote • Win monthly 🏆</p>
                </div>
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
