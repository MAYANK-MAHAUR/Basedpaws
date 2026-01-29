import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Menu, X, Wallet, Upload, User, PawPrint } from 'lucide-react'
import { Button } from './ui/button'
import { WalletConnect } from './WalletConnect'
import { MyProfile } from './MyProfile'
import { PhotoUpload } from './PhotoUpload'

export function Navbar() {
    const { isConnected } = useAccount()
    const [showProfile, setShowProfile] = useState(false)
    const [showUpload, setShowUpload] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <a href="#" className="flex items-center gap-2 flex-shrink-0">
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                <PawPrint className="size-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">BasedPaws</span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#feed" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                Feed
                            </a>
                            <a href="#leaderboard" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                                Leaderboard
                            </a>
                        </div>

                        {/* Right side buttons */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Mobile: Only show Connect Wallet if not connected, or small address if connected */}
                            <div className="md:hidden">
                                <WalletConnect />
                            </div>

                            {/* Desktop: Show full buttons */}
                            <div className="hidden md:flex items-center gap-3">
                                {isConnected && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setShowUpload(true)}
                                        >
                                            <Upload className="size-4" />
                                            Upload
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setShowProfile(true)}
                                        >
                                            <User className="size-4" />
                                            Profile
                                        </Button>
                                    </>
                                )}
                                <WalletConnect />
                            </div>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-secondary transition ml-2"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle menu"
                            >
                                {isOpen ? (
                                    <X className="size-5" />
                                ) : (
                                    <Menu className="size-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isOpen && (
                        <div className="md:hidden pb-4 space-y-2 border-t pt-2 mt-2">
                            {isConnected && (
                                <div className="grid grid-cols-2 gap-2 px-4 mb-4">
                                    <Button
                                        variant="outline"
                                        className="gap-2 justify-center"
                                        onClick={() => { setShowUpload(true); setIsOpen(false); }}
                                    >
                                        <Upload className="size-4" />
                                        Upload
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2 justify-center"
                                        onClick={() => { setShowProfile(true); setIsOpen(false); }}
                                    >
                                        <User className="size-4" />
                                        Profile
                                    </Button>
                                </div>
                            )}
                            <a
                                href="#feed"
                                className="block px-4 py-3 rounded-lg hover:bg-secondary font-medium transition"
                                onClick={() => setIsOpen(false)}
                            >
                                Feed
                            </a>
                            <a
                                href="#leaderboard"
                                className="block px-4 py-3 rounded-lg hover:bg-secondary font-medium transition"
                                onClick={() => setIsOpen(false)}
                            >
                                Leaderboard
                            </a>
                        </div>
                    )}
                </div>
            </nav>

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
                    <div className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-lg relative" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 rounded-full"
                            onClick={() => setShowUpload(false)}
                        >
                            <X className="size-4" />
                        </Button>
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Upload Pet Photo</h2>
                            <PhotoUpload onUploadComplete={() => setShowUpload(false)} />
                        </div>
                    </div>
                </div>
            )}

            {showProfile && (
                <MyProfile onClose={() => setShowProfile(false)} />
            )}
        </>
    )
}
