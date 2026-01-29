import { useName } from '@coinbase/onchainkit/identity'
import { base } from 'viem/chains'

// OnchainKit's useName hook for Basename resolution
// This is the official Coinbase SDK for Base integrations

export function useBasename(address) {
    const { data: basename, isLoading } = useName({
        address: address,
        chain: base,
    })

    return { basename, isLoading }
}
