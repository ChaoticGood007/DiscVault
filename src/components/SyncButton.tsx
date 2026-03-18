/*
 * Copyright 2026 Google LLC
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
import { RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import { syncMolds } from '@/app/actions/molds'

export default function SyncButton() {
  const [status, setStep] = useState<'idle' | 'syncing' | 'complete'>('idle')
  const [result, setResult] = useState<{ updated: number, created: number } | null>(null)

  const handleSync = async () => {
    setStep('syncing')
    try {
      const res = await syncMolds()
      setResult({ updated: res.updatedCount, created: res.createdCount })
      setStep('complete')
      setTimeout(() => setStep('idle'), 5000)
    } catch (e) {
      console.error(e)
      alert('Sync failed. Please check the console.')
      setStep('idle')
    }
  }

  if (status === 'syncing') {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest border border-indigo-100 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        Syncing Database...
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest border border-emerald-100">
        <CheckCircle2 className="w-4 h-4" />
        Success: {result?.created} New Molds
      </div>
    )
  }

  return (
    <button
      onClick={handleSync}
      className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
    >
      <RefreshCw className="w-4 h-4" />
      Sync Global DB
    </button>
  )
}
