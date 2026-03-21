/*
 * Copyright 2026 ChaoticGood007
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client'

import { useState } from 'react'
import { GitBranch, Loader2, Check } from 'lucide-react'
import { migrateLocationsFromInventory } from '@/app/actions/settings'
import { useRouter } from 'next/navigation'

export default function LocationMigrator() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ count: number; nodes: number } | null>(null)
  const router = useRouter()

  const run = async () => {
    setStatus('running')
    try {
      const res = await migrateLocationsFromInventory()
      setResult(res)
      setStatus('done')
      router.refresh() // re-fetch server data so the tree editor shows the imported nodes
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-slate-500 font-medium">
        {status === 'idle' && 'Scan all existing inventory location strings and use them to pre-populate the tree above.'}
        {status === 'running' && <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Scanning inventory…</span>}
        {status === 'done' && result && (
          <span className="flex items-center gap-2 text-emerald-600 font-bold">
            <Check className="w-4 h-4" />
            Imported {result.count} location{result.count !== 1 ? 's' : ''} into {result.nodes} root node{result.nodes !== 1 ? 's' : ''}. Review the tree above to mark bag locations.
          </span>
        )}
        {status === 'error' && <span className="text-red-500 font-bold">Migration failed. Check the console.</span>}
      </div>
      <button
        onClick={run}
        disabled={status === 'running' || status === 'done'}
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <GitBranch className="w-4 h-4" />
        Import from Inventory
      </button>
    </div>
  )
}
