import { useState, useEffect, useCallback } from 'react'

const PROFILES_KEY = 'basedpaws_profiles'

export function useProfiles() {
    const [profiles, setProfiles] = useState({}) // { address: { name, avatar, createdAt } }

    // Load profiles from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(PROFILES_KEY)
        if (stored) {
            try {
                setProfiles(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse profiles:', e)
            }
        }
    }, [])

    // Save profiles
    const saveProfiles = useCallback((newProfiles) => {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(newProfiles))
        setProfiles(newProfiles)
    }, [])

    // Get profile for an address
    const getProfile = useCallback((address) => {
        if (!address) return null
        return profiles[address.toLowerCase()] || null
    }, [profiles])

    // Check if address has a profile set up
    const hasProfile = useCallback((address) => {
        if (!address) return false
        const profile = profiles[address.toLowerCase()]
        return profile && profile.name
    }, [profiles])

    // Create or update profile
    const setProfile = useCallback((address, profileData) => {
        if (!address) return
        const key = address.toLowerCase()
        const newProfiles = {
            ...profiles,
            [key]: {
                ...profiles[key],
                ...profileData,
                updatedAt: Date.now(),
                createdAt: profiles[key]?.createdAt || Date.now(),
            }
        }
        saveProfiles(newProfiles)
    }, [profiles, saveProfiles])

    // Get display name for an address
    const getDisplayName = useCallback((address) => {
        if (!address) return 'Anonymous'
        const profile = profiles[address.toLowerCase()]
        if (profile?.name) return profile.name
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }, [profiles])

    // Get avatar for an address (returns emoji or custom)
    const getAvatar = useCallback((address) => {
        if (!address) return '🐾'
        const profile = profiles[address.toLowerCase()]
        return profile?.avatar || '🐾'
    }, [profiles])

    return {
        profiles,
        getProfile,
        hasProfile,
        setProfile,
        getDisplayName,
        getAvatar,
    }
}
