// Pinata IPFS Integration
// Free tier: 1GB storage, no card needed!
// Sign up at: https://app.pinata.cloud/register

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || ''
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'

// Check if Pinata is configured
export function isPinataConfigured() {
    return !!PINATA_JWT
}

// Upload file to Pinata
export async function uploadToIPFS(file) {
    // If no Pinata JWT, use localStorage fallback
    if (!PINATA_JWT) {
        return uploadToLocalStorage(file)
    }

    try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
            },
            body: formData,
        })

        if (!response.ok) {
            throw new Error('Pinata upload failed')
        }

        const data = await response.json()
        return {
            cid: data.IpfsHash,
            url: `${PINATA_GATEWAY}${data.IpfsHash}`,
        }
    } catch (error) {
        console.error('Pinata upload failed, using localStorage:', error)
        return uploadToLocalStorage(file)
    }
}

// Get IPFS URL from CID
export function getIPFSUrl(cid) {
    if (!cid) return null

    // Check localStorage first
    const stored = JSON.parse(localStorage.getItem('ipfs_files') || '{}')
    if (stored[cid]) {
        return stored[cid]
    }

    // Use Pinata gateway
    return `${PINATA_GATEWAY}${cid}`
}

// LocalStorage fallback for development
function generateMockCID() {
    const chars = 'abcdefghijklmnopqrstuvwxyz234567'
    let cid = 'Qm'
    for (let i = 0; i < 44; i++) {
        cid += chars[Math.floor(Math.random() * chars.length)]
    }
    return cid
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
}

async function uploadToLocalStorage(file) {
    const base64 = await fileToBase64(file)
    const cid = generateMockCID()

    const stored = JSON.parse(localStorage.getItem('ipfs_files') || '{}')
    stored[cid] = base64
    localStorage.setItem('ipfs_files', JSON.stringify(stored))

    return { cid, url: base64 }
}
