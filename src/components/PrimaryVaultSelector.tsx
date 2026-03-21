'use client'

import { useState } from 'react'
import { Check, Star } from 'lucide-react'
import { setPrimaryVault } from '@/app/actions/settings'

export default function PrimaryVaultSelector({ 
  vaults, 
  currentPrimary 
}: { 
  vaults: { id: string; name: string }[]
  currentPrimary?: string | null 
}) {
  const [isPending, setIsPending] = useState(false)

  const handleSelect = async (vaultId: string) => {
    setIsPending(true)
    await setPrimaryVault(vaultId)
    setIsPending(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {vaults.map(vault => (
        <button
          key={vault.id}
          disabled={isPending}
          onClick={() => handleSelect(vault.id)}
          className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            currentPrimary === vault.id 
              ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20' 
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-colors ${currentPrimary === vault.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              <Star className={`w-5 h-5 ${currentPrimary === vault.id ? 'fill-indigo-600' : ''}`} />
            </div>
            <div>
              <span className="font-bold block text-sm">{vault.name}</span>
              {currentPrimary === vault.id && <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mt-0.5 block">Active Primary Link</span>}
            </div>
          </div>
          {currentPrimary === vault.id && (
            <div className="bg-white p-1 rounded-full shadow-sm">
              <Check className="w-4 h-4 text-indigo-600" />
            </div>
          )}
        </button>
      ))}
      
      {vaults.length === 0 && (
        <p className="text-sm text-slate-500 italic p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center font-medium">No vaults discovered. Create a vault first!</p>
      )}
    </div>
  )
}
