import { useState, useEffect } from 'react'
import { getIPFSUrl } from '../lib/ipfs'

const PHOTOS_KEY = 'basedpaws_photos'

// Generate unique photo ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function usePhotos() {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)

    // Load photos from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(PHOTOS_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setPhotos(parsed)
            } catch (e) {
                console.error('Failed to parse photos:', e)
            }
        }
        setLoading(false)
    }, [])

    // Save photos to localStorage
    const savePhotos = (newPhotos) => {
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(newPhotos))
        setPhotos(newPhotos)
    }

    // Add a new photo
    const addPhoto = (photoData) => {
        const newPhoto = {
            id: generateId(),
            ...photoData,
            createdAt: Date.now(),
            votes: 0,
            donations: 0,
        }
        const updated = [newPhoto, ...photos]
        savePhotos(updated)
        return newPhoto
    }

    // Get photo by ID
    const getPhoto = (id) => {
        return photos.find(p => p.id === id)
    }

    // Update a photo (for editing)
    const updatePhoto = (id, updates) => {
        const updated = photos.map(p =>
            p.id === id ? { ...p, ...updates } : p
        )
        savePhotos(updated)
    }

    // Delete a photo
    const deletePhoto = (id) => {
        const updated = photos.filter(p => p.id !== id)
        savePhotos(updated)
    }

    // Update photo donations
    const updateDonations = (id, amount) => {
        const updated = photos.map(p =>
            p.id === id ? { ...p, donations: (p.donations || 0) + amount } : p
        )
        savePhotos(updated)
    }

    // Get photos sorted by votes
    const getTopPhotos = () => {
        return [...photos].sort((a, b) => b.votes - a.votes)
    }

    // Get recent photos
    const getRecentPhotos = () => {
        return [...photos].sort((a, b) => b.createdAt - a.createdAt)
    }

    return {
        photos,
        loading,
        addPhoto,
        getPhoto,
        updatePhoto,
        deletePhoto,
        updateDonations,
        getTopPhotos,
        getRecentPhotos,
    }
}

