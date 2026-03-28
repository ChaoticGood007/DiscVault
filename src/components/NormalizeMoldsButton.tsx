'use client'

import { useState } from 'react'
import { FileWarning, CheckCircle2, Loader2 } from 'lucide-react'
import { normalizeDatabaseMolds } from '@/app/actions/inventory'

export default function NormalizeMoldsButton() {
  const [status, setStep] = useState<'idle' | 'running' | 'complete'>('idle')
  const [result, setResult] = useState<{ updated: number } | null>(null)

  const handleNormalize = async () => {
    setStep('running')
    try {
      const res = await normalizeDatabaseMolds()
      setResult({ updated: res.updatedCount })
      setStep('complete')
      setTimeout(() => setStep('idle'), 5000)
    } catch (e) {
      console.error(e)
      alert('Normalization failed. Please check the console.')
      setStep('idle')
    }
  }

  if (status === 'running') {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest border border-indigo-100 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        Processing...
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest border border-emerald-100">
        <CheckCircle2 className="w-4 h-4" />
        Success: {result?.updated} Updated
      </div>
    )
  }

  return (
    <button
      onClick={handleNormalize}
      className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
    >
      <FileWarning className="w-4 h-4 text-amber-500" />
      Normalize Legacy Data
    </button>
  )
}
