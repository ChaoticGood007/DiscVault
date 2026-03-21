'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

export default function VaultSwitcher({ 
  vaults, 
  activeId 
}: { 
  vaults: { id: string, name: string }[]
  activeId: string 
}) {
  const router = useRouter()

  return (
    <div className="relative group flex items-center max-w-[200px] sm:max-w-xs">
      <select
        value={activeId}
        onChange={(e) => {
          if (e.target.value === 'manage') {
            router.push('/vaults')
          } else {
            router.push(`/v/${e.target.value}`)
          }
        }}
        className="appearance-none w-full bg-transparent text-sm sm:text-xl font-black text-slate-900 leading-tight outline-none focus:ring-0 cursor-pointer pr-6 sm:pr-8 truncate hover:text-indigo-600 transition-colors"
      >
        {vaults.map(v => (
          <option key={v.id} value={v.id} className="text-base font-bold text-slate-900">
            {v.name}
          </option>
        ))}
        <option disabled>──────────</option>
        <option value="manage" className="text-base font-black text-indigo-600">
          ⚙️ Manage Workspaces
        </option>
      </select>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 transition-colors">
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
  )
}
