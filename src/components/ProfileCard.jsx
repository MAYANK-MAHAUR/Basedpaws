import { useRef, useEffect, useState } from 'react'

export function ProfileCard({ address, stats, achievements }) {
    const canvasRef = useRef(null)
    const [cardUrl, setCardUrl] = useState(null)

    // Generate card on canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const width = 400
        const height = 500

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height)
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(0.5, '#16213e')
        gradient.addColorStop(1, '#0f0f23')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // Border glow effect
        ctx.strokeStyle = '#0052FF'
        ctx.lineWidth = 3
        ctx.strokeRect(10, 10, width - 20, height - 20)

        // Inner border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.strokeRect(20, 20, width - 40, height - 40)

        // Logo
        ctx.font = '40px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('🐾', width / 2, 70)

        // Title
        ctx.font = 'bold 24px Inter, Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText('BasedPaws', width / 2, 110)

        // Subtitle
        ctx.font = '12px Inter, Arial'
        ctx.fillStyle = '#0052FF'
        ctx.fillText('ON BASE', width / 2, 130)

        // Address
        const shortAddr = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not Connected'
        ctx.font = '14px monospace'
        ctx.fillStyle = '#a1a1aa'
        ctx.fillText(shortAddr, width / 2, 170)

        // Stats section
        ctx.font = 'bold 16px Inter, Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText('📊 Stats', width / 2, 220)

        // Stats boxes
        const statsData = [
            { label: 'Uploads', value: stats.uploads, icon: '📸' },
            { label: 'Votes Received', value: stats.receivedVotes, icon: '❤️' },
            { label: 'Achievements', value: achievements.length, icon: '🏆' },
        ]

        let yPos = 250
        statsData.forEach(stat => {
            ctx.font = '32px Arial'
            ctx.fillText(stat.icon, 80, yPos + 5)

            ctx.font = 'bold 20px Inter, Arial'
            ctx.fillStyle = '#0052FF'
            ctx.textAlign = 'left'
            ctx.fillText(String(stat.value), 120, yPos)

            ctx.font = '12px Inter, Arial'
            ctx.fillStyle = '#71717a'
            ctx.fillText(stat.label, 120, yPos + 18)

            ctx.textAlign = 'center'
            yPos += 50
        })

        // Achievements section
        ctx.textAlign = 'center'
        ctx.font = 'bold 14px Inter, Arial'
        ctx.fillStyle = '#ffffff'
        ctx.fillText('🎖️ Badges', width / 2, 420)

        // Show achievement icons
        const badgeIcons = achievements.slice(0, 6).map(a => a.icon).join(' ')
        ctx.font = '24px Arial'
        ctx.fillText(badgeIcons || '🔒 None yet', width / 2, 455)

        // Watermark
        ctx.font = '10px Inter, Arial'
        ctx.fillStyle = '#3f3f46'
        ctx.fillText('basedpaws.xyz • Built on Base', width / 2, height - 15)

        // Save as data URL
        setCardUrl(canvas.toDataURL('image/png'))
    }, [address, stats, achievements])

    const handleDownload = () => {
        if (!cardUrl) return

        const link = document.createElement('a')
        link.download = `basedpaws-card-${address?.slice(0, 8) || 'anon'}.png`
        link.href = cardUrl
        link.click()
    }

    const handleShare = async () => {
        if (!cardUrl) return

        try {
            const blob = await (await fetch(cardUrl)).blob()
            const file = new File([blob], 'basedpaws-card.png', { type: 'image/png' })

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My BasedPaws Card',
                    text: 'Check out my pet photo achievements on BasedPaws! 🐾',
                    files: [file],
                })
            } else {
                // Fallback: copy to clipboard or download
                handleDownload()
            }
        } catch (error) {
            console.error('Share failed:', error)
            handleDownload()
        }
    }

    return (
        <div className="profile-card-container">
            <div className="profile-card-preview">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={500}
                    style={{ borderRadius: '16px', maxWidth: '100%', height: 'auto' }}
                />
            </div>

            <div className="profile-card-actions">
                <button className="btn btn-primary" onClick={handleDownload}>
                    <span>📥</span> Download Card
                </button>
                <button className="btn btn-outline" onClick={handleShare}>
                    <span>📤</span> Share
                </button>
            </div>

            <p className="profile-card-tip">
                💡 Share your card on Twitter/Farcaster to show off your achievements!
            </p>
        </div>
    )
}
