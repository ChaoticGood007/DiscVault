'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ClientInventoryLink({ 
  vaultId, 
  baseHref,
  children, 
  className 
}: { 
  vaultId: string, 
  baseHref: string,
  children: React.ReactNode, 
  className?: string 
}) {
  const router = useRouter()

  return (
    <Link
      href={baseHref}
      onClick={(e) => {
        // Prevent default Next.js stagnant layout cache linking
        e.preventDefault()
        
        // Aggressively fetch the live browser cookie at the moment of the click
        const cname = `vault_filter_${vaultId}=`
        const decodedCookie = typeof document !== 'undefined' ? decodeURIComponent(document.cookie) : ''
        let cval = ''
        const ca = decodedCookie.split(';')
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i]
          while (c.charAt(0) == ' ') c = c.substring(1)
          if (c.indexOf(cname) == 0) cval = c.substring(cname.length, c.length)
        }
        
        const target = vaultId === 'all' ? '/v/all' : `/v/${vaultId}`
        router.push(cval ? `${target}?${cval}` : target)
      }}
      className={className}
    >
      {children}
    </Link>
  )
}
