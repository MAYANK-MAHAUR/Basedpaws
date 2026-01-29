/**
 * Image Processor - Compression & Quality Analysis
 * Handles image optimization before IPFS upload
 */

/**
 * Process and compress an image file
 * @param {File} file - Original image file
 * @param {Object} options - Processing options
 * @returns {Promise<{blob: Blob, metrics: Object, savings: string}>}
 */
export async function processImage(file, options = {}) {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85,
        format = 'webp' // Modern format, ~30% smaller than JPEG
    } = options

    return new Promise((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        img.onload = () => {
            // Calculate dimensions maintaining aspect ratio
            let { width, height } = img
            const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)

            canvas.width = width
            canvas.height = height

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(img, 0, 0, width, height)

            // Analyze image quality
            const metrics = analyzeQuality(img, canvas)

            // Determine best format (fallback to JPEG if WebP not ideal)
            const outputFormat = format === 'webp' ? 'image/webp' : 'image/jpeg'

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'))
                        return
                    }

                    const originalSize = file.size
                    const compressedSize = blob.size
                    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)

                    resolve({
                        blob,
                        metrics,
                        originalSize,
                        compressedSize,
                        savings: `${savings}%`,
                        dimensions: { width, height }
                    })
                },
                outputFormat,
                quality
            )

            // Cleanup
            URL.revokeObjectURL(img.src)
        }

        img.onerror = () => {
            URL.revokeObjectURL(img.src)
            reject(new Error('Failed to load image'))
        }

        img.src = URL.createObjectURL(file)
    })
}

/**
 * Analyze image quality metrics
 */
function analyzeQuality(img, canvas) {
    const { width, height } = img
    const pixels = width * height
    const aspectRatio = width / height

    // Resolution score (0-1)
    // Target: 1920x1080 = 2,073,600 pixels
    const resolutionScore = Math.min(pixels / 2073600, 1)

    // Aspect ratio score (0-1)
    // Ideal: 4:3 to 16:9 (0.75 to 1.78)
    const aspectScore = (aspectRatio >= 0.5 && aspectRatio <= 2) ? 1 : 0.5

    // Check if high resolution
    const isHighRes = width >= 800 && height >= 600

    // Brightness/contrast analysis (sample center pixels)
    const ctx = canvas.getContext('2d')
    const sampleSize = Math.min(100, width, height)
    const startX = Math.floor((canvas.width - sampleSize) / 2)
    const startY = Math.floor((canvas.height - sampleSize) / 2)

    let brightness = 0
    let contrast = 0

    try {
        const imageData = ctx.getImageData(startX, startY, sampleSize, sampleSize)
        const data = imageData.data
        let min = 255, max = 0, sum = 0

        for (let i = 0; i < data.length; i += 4) {
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            sum += luminance
            min = Math.min(min, luminance)
            max = Math.max(max, luminance)
        }

        brightness = sum / (data.length / 4) / 255
        contrast = (max - min) / 255
    } catch (e) {
        // CORS or other issues - use defaults
        brightness = 0.5
        contrast = 0.5
    }

    // Overall quality score (0-1)
    const qualityScore = (
        resolutionScore * 0.4 +
        aspectScore * 0.2 +
        Math.min(brightness * 2, 1) * 0.2 + // Penalize very dark images
        contrast * 0.2
    )

    return {
        resolution: { width, height, pixels },
        aspectRatio: aspectRatio.toFixed(2),
        isHighRes,
        brightness: brightness.toFixed(2),
        contrast: contrast.toFixed(2),
        qualityScore: Math.round(qualityScore * 100) / 100,
        qualityLabel: getQualityLabel(qualityScore)
    }
}

/**
 * Get human-readable quality label
 */
function getQualityLabel(score) {
    if (score >= 0.8) return 'Excellent'
    if (score >= 0.6) return 'Good'
    if (score >= 0.4) return 'Fair'
    return 'Low'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Check if file is a valid image
 */
export function isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return validTypes.includes(file.type)
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(img.src)
            resolve({ width: img.width, height: img.height })
        }
        img.onerror = () => {
            URL.revokeObjectURL(img.src)
            reject(new Error('Failed to load image'))
        }
        img.src = URL.createObjectURL(file)
    })
}
