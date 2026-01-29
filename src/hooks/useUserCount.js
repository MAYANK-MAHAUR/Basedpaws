import { useState, useEffect } from 'react'

const STORAGE_KEY = 'basedpaws_unique_users'

export function useUserCount() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        // Load existing users from localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        const users = stored ? JSON.parse(stored) : []
        setCount(users.length)
    }, [])

    const registerUser = (address) => {
        if (!address) return

        const stored = localStorage.getItem(STORAGE_KEY)
        const users = stored ? JSON.parse(stored) : []

        // Only add if not already registered
        if (!users.includes(address.toLowerCase())) {
            users.push(address.toLowerCase())
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
            setCount(users.length)
        }
    }

    return { count, registerUser }
}
