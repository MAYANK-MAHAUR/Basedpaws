import { useBasename } from '../hooks/useBasename'
import { useProfiles } from '../hooks/useProfiles'

export function Basename({ address, className = '' }) {
    const { basename, isLoading } = useBasename(address)
    const { getDisplayName } = useProfiles()

    // Priority: Basename (ENS) -> App Profile Name -> Truncated Address

    // Note: getDisplayName returns "Anonymous" or truncated if no profile. 
    // We might want to prefer the Basename if available, otherwise the Profile Name.

    const profileName = getDisplayName(address)
    const isProfileDefault = profileName.startsWith('0x') || profileName === 'Anonymous' || profileName.startsWith('User')

    if (isLoading) return <span className={`animate-pulse ${className}`}>{address?.slice(0, 6)}...</span>

    // If we have a Basename, show it (it's the ultimate source of truth on Base)
    if (basename) return <span className={className}>{basename}</span>

    // Otherwise show the profile name (which is user-set or auto-generated)
    return <span className={className}>{profileName}</span>
}
