'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function FilterPreserver({ vaultId }: { vaultId: string }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // URLSearchParams.toString() natively encodes special characters making it safe for cookie storage
    const encodedParams = searchParams.toString()
    // Persist layout settings and filters for 30 days per vault
    document.cookie = `vault_filter_${vaultId}=${encodedParams}; path=/; max-age=2592000; SameSite=Lax`
  }, [searchParams, vaultId])

  return null
}
