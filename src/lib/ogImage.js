/**
 * OG Image Generator
 * Creates Open Graph images for social sharing (Warpcast, Twitter, etc.)
 */

/**
 * Generate an OG image for a photo
 * @param {Object} photo - Photo object with title, imageUrl, votes, etc.
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Base64 data URL of the generated image
 */
export async function generateOGImage(photo, options = {}) {
    const {
        width = 1200,
        height = 630,
        backgroundColor = '#0a0a0a',
        accentColor = '#0052FF',
        textColor = '#ffffff'
    } = options

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'rgba(0, 82, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Load and draw the photo
    try {
        const img = await loadImage(photo.imageUrl)

        // Calculate image dimensions (left side, with padding)
        const imgSize = 500
        const imgX = 50
        const imgY = (height - imgSize) / 2

        // Draw image container with rounded corners
        ctx.save()
        roundedRect(ctx, imgX, imgY, imgSize, imgSize, 20)
        ctx.clip()

        // Draw image centered and cropped
        const scale = Math.max(imgSize / img.width, imgSize / img.height)
        const scaledW = img.width * scale
        const scaledH = img.height * scale
        const offsetX = imgX + (imgSize - scaledW) / 2
        const offsetY = imgY + (imgSize - scaledH) / 2
        ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH)
        ctx.restore()

        // Border around image
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 2
        roundedRect(ctx, imgX, imgY, imgSize, imgSize, 20)
        ctx.stroke()
    } catch (e) {
        // If image fails, draw placeholder
        ctx.fillStyle = '#1a1a1a'
        roundedRect(ctx, 50, 65, 500, 500, 20)
        ctx.fill()

        ctx.font = '120px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#666'
        ctx.fillText('🐾', 300, 350)
    }

    // Right side content
    const contentX = 600
    const contentWidth = 550

    // Title
    ctx.fillStyle = textColor
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'

    // Wrap title text
    const titleLines = wrapText(ctx, photo.title || 'Untitled', contentWidth)
    let titleY = 180
    titleLines.slice(0, 2).forEach((line, i) => {
        ctx.fillText(line, contentX, titleY + i * 60)
    })

    // Stats
    ctx.font = '32px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#999'

    const statsY = titleY + titleLines.length * 60 + 40
    ctx.fillText(`❤️ ${photo.votes || 0} votes`, contentX, statsY)

    if (photo.donations) {
        ctx.fillText(`💎 ${photo.donations.toFixed(4)} ETH tips`, contentX, statsY + 50)
    }

    // Branding
    ctx.fillStyle = accentColor
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
    ctx.fillText('🐾 BasedPaws', contentX, height - 80)

    // Tagline
    ctx.fillStyle = '#666'
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillText('Share & Tip Pets on Base', contentX, height - 40)

    // Decorative accent line
    ctx.fillStyle = accentColor
    ctx.fillRect(contentX, 120, 80, 4)

    return canvas.toDataURL('image/png')
}

/**
 * Load an image and return a promise
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

/**
 * Draw a rounded rectangle path
 */
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

/**
 * Wrap text to fit within a width
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ')
    const lines = []
    let currentLine = ''

    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
        } else {
            currentLine = testLine
        }
    })

    if (currentLine) {
        lines.push(currentLine)
    }

    return lines
}

/**
 * Copy OG image to clipboard
 */
export async function copyOGImageToClipboard(photo) {
    const dataUrl = await generateOGImage(photo)

    // Convert data URL to blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    try {
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ])
        return true
    } catch (e) {
        console.error('Failed to copy to clipboard:', e)
        return false
    }
}

/**
 * Download OG image
 */
export async function downloadOGImage(photo, filename = 'basedpaws-share.png') {
    const dataUrl = await generateOGImage(photo)

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Get meta tags for a photo (for SSR or dynamic injection)
 */
export function getOGMetaTags(photo, baseUrl = 'https://basedpaws.com') {
    return {
        'og:title': `${photo.title} | BasedPaws`,
        'og:description': `Check out this pet photo on BasedPaws! ❤️ ${photo.votes || 0} votes`,
        'og:image': `${baseUrl}/api/og/${photo.id}`,
        'og:url': `${baseUrl}/photo/${photo.id}`,
        'og:type': 'website',
        'twitter:card': 'summary_large_image',
        'twitter:title': `${photo.title} | BasedPaws`,
        'twitter:description': `Check out this pet photo on BasedPaws!`,
        'twitter:image': `${baseUrl}/api/og/${photo.id}`,
        'fc:frame': 'vNext',
        'fc:frame:image': `${baseUrl}/api/og/${photo.id}`,
        'fc:frame:button:1': '❤️ Vote',
        'fc:frame:button:2': '💎 Tip'
    }
}
