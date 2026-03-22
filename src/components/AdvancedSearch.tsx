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
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'
import LocationTreePicker from './LocationTreePicker'

export interface AdvancedFilters {
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
  plastic?: string
  color?: string
  stamp?: string
  // locations stored as comma-separated string in URL
  locations?: string
}

export const ADVANCED_KEYS: (keyof AdvancedFilters)[] = [
  'minSpeed', 'maxSpeed', 'minGlide', 'maxGlide', 'minTurn', 'maxTurn',
  'minFade', 'maxFade', 'minWeight', 'maxWeight', 'minCond', 'maxCond',
  'ink', 'plastic', 'color', 'stamp', 'locations'
]

const allowNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','-','.'].includes(e.key)) return
  if (!/[\d]/.test(e.key)) e.preventDefault()
}

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
const labelCls = "text-[10px] font-black text-slate-400 uppercase tracking-widest"

interface AdvancedSearchProps {
  filters: AdvancedFilters
  availableLocations: string[]
  onClose: () => void
}

export default function AdvancedSearch({ filters, availableLocations, onClose }: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters)

  // Parse current selected locations from comma-separated string
  const selectedLocations = localFilters.locations ? localFilters.locations.split(',').filter(Boolean) : []

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
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
    onClose()
  }

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    ADVANCED_KEYS.forEach(k => params.delete(k))
    router.push(`${pathname}?${params.toString()}`)
    setLocalFilters({})
    onClose()
  }

  return (
    <div className="absolute top-full right-0 mt-4 w-[440px] bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 z-[150] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-indigo-600">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-black text-slate-900">Advanced Filters</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Flight Numbers */}
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Flight Numbers</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {([
              ['Speed', 'minSpeed', 'maxSpeed'],
              ['Glide', 'minGlide', 'maxGlide'],
              ['Turn', 'minTurn', 'maxTurn'],
              ['Fade', 'minFade', 'maxFade'],
            ] as [string, keyof AdvancedFilters, keyof AdvancedFilters][]).map(([label, minKey, maxKey]) => (
              <div key={label} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min"
                    value={localFilters[minKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(minKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                  <span className="text-slate-200 font-bold shrink-0">—</span>
                  <input type="text" inputMode="decimal" placeholder="Max"
                    value={localFilters[maxKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(maxKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Physical Properties */}
        <div className="pt-4 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Physical Properties</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {([
              ['Weight (g)', 'minWeight', 'maxWeight'],
              ['Condition', 'minCond', 'maxCond'],
            ] as [string, keyof AdvancedFilters, keyof AdvancedFilters][]).map(([label, minKey, maxKey]) => (
              <div key={label} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min"
                    value={localFilters[minKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(minKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                  <span className="text-slate-200 font-bold shrink-0">—</span>
                  <input type="text" inputMode="decimal" placeholder="Max"
                    value={localFilters[maxKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(maxKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                </div>
              </div>
            ))}
            {([
              ['Plastic', 'plastic', 'e.g. Champion, Star...'],
              ['Color', 'color', 'e.g. Red, Blue...'],
              ['Stamp', 'stamp', 'e.g. Swirly, Stars...'],
            ] as [string, keyof AdvancedFilters, string][]).map(([label, key, ph]) => (
              <div key={key} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <input type="text" placeholder={ph}
                  value={(localFilters[key] as string) ?? ''}
                  onChange={(e) => handleUpdate(key, e.target.value || undefined)}
                  className={inputCls} />
              </div>
            ))}

            {/* Location tree picker */}
            {availableLocations.length > 0 && (
              <div className="space-y-2 col-span-2">
                <label className={labelCls}>Location</label>
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {selectedLocations.map(loc => (
                      <span key={loc} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg">
                        {loc.split('/').pop()}
                        <button type="button" onClick={() => {
                          const next = selectedLocations.filter(l => l !== loc)
                          setLocalFilters(prev => ({ ...prev, locations: next.length ? next.join(',') : undefined }))
                        }} className="hover:text-indigo-900">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <LocationTreePicker
                  availableLocations={availableLocations}
                  selectedLocations={selectedLocations}
                  onChange={(locs) => setLocalFilters(prev => ({ ...prev, locations: locs.length ? locs.join(',') : undefined }))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Ink Status */}
        <div className="pt-4 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Ink Status</p>
          <div className="flex gap-2">
            {['any', 'none', 'exists'].map((option) => (
              <button key={option}
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

      <div className="mt-8 pt-6 border-t border-slate-50 flex gap-3">
        <button onClick={resetFilters}
          className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button onClick={applyFilters}
          className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100">
          Apply Filters
        </button>
      </div>
    </div>
  )
}
