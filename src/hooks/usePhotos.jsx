import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getIPFSUrl } from '../lib/ipfs'

const PhotosContext = createContext(null)

const PHOTOS_KEY = 'basedpaws_photos'

// Generate unique photo ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// localStorage fallback functions
function getLocalPhotos() {
    try {
        return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]')
    } catch {
        return []
    }
}

function saveLocalPhotos(photos) {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos))
}

export function PhotosProvider({ children }) {
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)

    // Load photos
    const loadPhotos = useCallback(async () => {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase fetch error:', error)
                setPhotos(getLocalPhotos())
            } else {
                const formattedPhotos = data.map(p => ({
                    id: p.id,
                    title: p.title,
                    cid: p.cid,
                    imageUrl: p.image_url || getIPFSUrl(p.cid),
                    ownerAddress: p.owner_address,
                    createdAt: new Date(p.created_at).getTime(),
                    votes: p.votes || 0,
                    donations: p.donations || 0,
                    qualityScore: p.quality_score || 0.5,
                }))
                setPhotos(formattedPhotos)
            }
        } else {
            setPhotos(getLocalPhotos())
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        loadPhotos()

        // Subscribe to real-time changes
        if (isSupabaseConfigured()) {
            const subscription = supabase
                .channel('photos_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
                    loadPhotos()
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }
    }, [loadPhotos])

    // Add a new photo
    const addPhoto = useCallback(async (photoData) => {
        const newPhoto = {
            id: generateId(),
            ...photoData,
            createdAt: Date.now(),
            votes: 0,
            donations: 0,
        }

        // Optimistically update UI immediately
        setPhotos(prev => [newPhoto, ...prev])

        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('photos').insert({
                id: newPhoto.id,
                title: newPhoto.title,
                cid: newPhoto.cid,
                image_url: newPhoto.imageUrl,
                owner_address: newPhoto.ownerAddress,
                created_at: new Date(newPhoto.createdAt).toISOString(),
                votes: 0,
                donations: 0,
                quality_score: newPhoto.qualityScore || 0.5,
            })

            if (error) {
                console.error('Supabase insert error:', error)
                // Fallback to localStorage
                const local = getLocalPhotos()
                saveLocalPhotos([newPhoto, ...local])
            }
        } else {
            const local = getLocalPhotos()
            saveLocalPhotos([newPhoto, ...local])
        }

        return newPhoto
    }, [])

    // Get photo by ID
    const getPhoto = useCallback((id) => {
        return photos.find(p => p.id === id)
    }, [photos])

    // Update a photo
    const updatePhoto = useCallback(async (id, updates) => {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

        if (isSupabaseConfigured()) {
            const dbUpdates = {}
            if (updates.title) dbUpdates.title = updates.title
            if (updates.votes !== undefined) dbUpdates.votes = updates.votes
            if (updates.donations !== undefined) dbUpdates.donations = updates.donations

            const { error } = await supabase
                .from('photos')
                .update(dbUpdates)
                .eq('id', id)

            if (error) console.error('Supabase update error:', error)
        } else {
            const local = getLocalPhotos()
            saveLocalPhotos(local.map(p => p.id === id ? { ...p, ...updates } : p))
        }
    }, [])

    // Delete a photo
    const deletePhoto = useCallback(async (id) => {
        setPhotos(prev => prev.filter(p => p.id !== id))

        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('photos').delete().eq('id', id)
            if (error) console.error('Supabase delete error:', error)
        } else {
            const local = getLocalPhotos()
            saveLocalPhotos(local.filter(p => p.id !== id))
        }
    }, [])

    // Update photo donations
    const updateDonations = useCallback(async (id, amount) => {
        const photo = photos.find(p => p.id === id)
        const newDonations = (photo?.donations || 0) + amount

        setPhotos(prev => prev.map(p =>
            p.id === id ? { ...p, donations: newDonations } : p
        ))

        if (isSupabaseConfigured()) {
            const { error } = await supabase
                .from('photos')
                .update({ donations: newDonations })
                .eq('id', id)

            if (error) console.error('Supabase donation update error:', error)
        } else {
            const local = getLocalPhotos()
            saveLocalPhotos(local.map(p =>
                p.id === id ? { ...p, donations: newDonations } : p
            ))
        }
    }, [photos])

    // Get photos sorted by votes
    const getTopPhotos = useCallback(() => {
        return [...photos].sort((a, b) => b.votes - a.votes)
    }, [photos])

    // Get recent photos
    const getRecentPhotos = useCallback(() => {
        return [...photos].sort((a, b) => b.createdAt - a.createdAt)
    }, [photos])

    const value = {
        photos,
        loading,
        addPhoto,
        getPhoto,
        updatePhoto,
        deletePhoto,
        updateDonations,
        getTopPhotos,
        getRecentPhotos,
        refreshPhotos: loadPhotos,
    }

    return (
        <PhotosContext.Provider value={value}>
            {children}
        </PhotosContext.Provider>
    )
}

export function usePhotos() {
    const context = useContext(PhotosContext)
    if (!context) {
        throw new Error('usePhotos must be used within a PhotosProvider')
    }
    return context
}
