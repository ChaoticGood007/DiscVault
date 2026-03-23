'use client'

import { useState } from 'react'
import LocationTreeEditor from './LocationTreeEditor'

interface Vault {
  id: string
  name: string
  locationTree: string
}

export default function VaultLocationSettings({ vaults }: { vaults: Vault[] }) {
  const [selectedVaultId, setSelectedVaultId] = useState(vaults.length > 0 ? vaults[0].id : '')
  
  if (vaults.length === 0) return <p className="text-sm text-slate-500">You must create a vault before managing locations.</p>
  
  const currentVault = vaults.find(v => v.id === selectedVaultId)
  
  let tree = []
  try {
    if (currentVault && currentVault.locationTree) {
      tree = JSON.parse(currentVault.locationTree)
    }
  } catch {
    tree = []
  }

  return (
    <div className="space-y-6 md:col-span-2 mt-4 pt-4 border-t border-slate-50">
      <div className="flex items-center gap-4">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Vault</label>
        <select
          value={selectedVaultId}
          onChange={(e) => setSelectedVaultId(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all max-w-xs w-full"
        >
          {vaults.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      
      {/* We use a key based on the vault ID so the internal tree state strictly resets per vault switch */}
      <LocationTreeEditor key={selectedVaultId} vaultId={selectedVaultId} initialTree={tree} />
    </div>
  )
}
