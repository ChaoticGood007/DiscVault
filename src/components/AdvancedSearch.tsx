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
import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'

interface AdvancedFilters {
  minSpeed?: number
  maxSpeed?: number
  minGlide?: number
  maxGlide?: number
  minTurn?: number
  maxTurn?: number
  minFade?: number
  maxFade?: number
  minWeight?: number
  maxWeight?: number
  minCond?: number
  maxCond?: number
  ink?: string
}

interface AdvancedSearchProps {
  filters: AdvancedFilters
  onClose: () => void
}

export default function AdvancedSearch({ filters, onClose }: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local state for each filter field
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters)

  const handleUpdate = (key: keyof AdvancedFilters, value: string | number | undefined) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })
    
    params.set('page', '1') // Reset to first page
    router.push(`/?${params.toString()}`)
    onClose()
  }

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    const keysToClear = ['minSpeed', 'maxSpeed', 'minGlide', 'maxGlide', 'minTurn', 'maxTurn', 'minFade', 'maxFade', 'minWeight', 'maxWeight', 'minCond', 'maxCond', 'ink']
    keysToClear.forEach(k => params.delete(k))
    router.push(`/?${params.toString()}`)
    setLocalFilters({})
    onClose()
  }

  const RangeInput = ({ label, minKey, maxKey }: { label: string, minKey: keyof AdvancedFilters, maxKey: keyof AdvancedFilters }) => {
    const allowNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','-','.'].includes(e.key)) return
      if (!/[\d]/.test(e.key)) e.preventDefault()
    }
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Min"
            value={localFilters[minKey] ?? ''}
            onKeyDown={allowNumeric}
            onChange={(e) => handleUpdate(minKey, e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
          />
          <span className="text-slate-200 font-bold shrink-0">—</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Max"
            value={localFilters[maxKey] ?? ''}
            onKeyDown={allowNumeric}
            onChange={(e) => handleUpdate(maxKey, e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 z-[150] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-indigo-600">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-black text-slate-900">Advanced Filters</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <RangeInput label="Speed" minKey="minSpeed" maxKey="maxSpeed" />
        <RangeInput label="Glide" minKey="minGlide" maxKey="maxGlide" />
        <RangeInput label="Turn" minKey="minTurn" maxKey="maxTurn" />
        <RangeInput label="Fade" minKey="minFade" maxKey="maxFade" />
        <RangeInput label="Weight (g)" minKey="minWeight" maxKey="maxWeight" />
        <RangeInput label="Condition" minKey="minCond" maxKey="maxCond" />
        
        <div className="space-y-2 col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ink Status</label>
          <div className="flex gap-2">
            {['any', 'none', 'exists'].map((option) => (
              <button
                key={option}
                onClick={() => handleUpdate('ink', option === 'any' ? undefined : option)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  (localFilters.ink || 'any') === option 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-50 flex gap-3">
        <button
          onClick={resetFilters}
          className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={applyFilters}
          className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
