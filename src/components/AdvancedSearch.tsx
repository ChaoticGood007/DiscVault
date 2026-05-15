'use client'

import { useState, useEffect } from 'react'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { extractSearchTokens } from '@/lib/searchParser'
import MultiSelectDropdown from './MultiSelectDropdown'
const LocationTreePicker = dynamic(() => import('./LocationTreePicker'), { ssr: false })

interface AdvancedSearchProps {
  categories: string[]
  brands: string[]
  plastics: string[]
  colors: string[]
  stamps: string[]
  stampFoils: string[]
  availableLocations: string[]
  initialQuery?: string
  onAppendSearch: (query: string) => void
  onClose: () => void
}

const allowNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','-','.'].includes(e.key)) return
  if (!/[\d]/.test(e.key)) e.preventDefault()
}

const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
const labelCls = "text-[10px] font-black text-slate-400 uppercase tracking-widest"

export default function AdvancedSearch({ 
  categories, brands,
  plastics, colors, stamps, stampFoils,
  availableLocations,
  initialQuery,
  onAppendSearch, onClose 
}: AdvancedSearchProps) {
  
  const [localState, setLocalState] = useState<Record<string, any>>({})

  useEffect(() => {
    setLocalState(extractSearchTokens(initialQuery || ''))
  }, [initialQuery])

  const handleUpdate = (key: string, value: any) => {
    setLocalState(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const tokens: string[] = []

    const addRange = (minKey: string, maxKey: string, field: string) => {
      const min = localState[minKey];
      const max = localState[maxKey];
      if (min && max) tokens.push(`${field}:${min}-${max}`)
      else if (min) tokens.push(`${field}:>=${min}`)
      else if (max) tokens.push(`${field}:<=${max}`)
    }

    addRange('minSpeed', 'maxSpeed', 'speed')
    addRange('minGlide', 'maxGlide', 'glide')
    addRange('minTurn', 'maxTurn', 'turn')
    addRange('minFade', 'maxFade', 'fade')
    addRange('minWeight', 'maxWeight', 'weight')
    addRange('minCond', 'maxCond', 'condition')

    const addMulti = (key: string, field: string) => {
      if (localState[key]) {
        localState[key].split(',').filter(Boolean).forEach((val: string) => {
          tokens.push(`${field}:"${val}"`)
        })
      }
    }

    addMulti('category', 'category')
    addMulti('brand', 'brand')
    addMulti('plastic', 'plastic')
    addMulti('color', 'color')
    addMulti('stamp', 'stamp')
    addMulti('stampFoil', 'foil')

    if (localState.locations) {
      localState.locations.split(',').filter(Boolean).forEach((val: string) => {
        tokens.push(`location:"${val}"`)
      })
    }

    if (localState.ink && localState.ink !== 'any') {
      tokens.push(`ink:${localState.ink}`)
    }

    if (tokens.length > 0) {
      onAppendSearch(tokens.join(' '))
    }
    onClose()
  }

  return (
    <div className="absolute top-full right-0 mt-4 w-[440px] bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 z-[150] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-indigo-600">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-black text-slate-900">Query Builder</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
        {/* Core Properties */}
        <div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Core Properties</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-2">
              <label className={labelCls}>Category</label>
              <MultiSelectDropdown
                label="Category"
                options={categories}
                selectedValues={(localState.category || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('category', vals.length ? vals.join(',') : undefined)}
                placeholder="All Categories"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Brand</label>
              <MultiSelectDropdown
                label="Brand"
                options={brands}
                selectedValues={(localState.brand || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('brand', vals.length ? vals.join(',') : undefined)}
                placeholder="All Brands"
                align="right"
              />
            </div>
          </div>
        </div>

        {/* Flight Numbers */}
        <div className="pt-4 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Flight Numbers</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {([
              ['Speed', 'minSpeed', 'maxSpeed'],
              ['Glide', 'minGlide', 'maxGlide'],
              ['Turn', 'minTurn', 'maxTurn'],
              ['Fade', 'minFade', 'maxFade'],
            ] as [string, string, string][]).map(([label, minKey, maxKey]) => (
              <div key={label} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min"
                    value={localState[minKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(minKey, e.target.value !== '' ? e.target.value : undefined)}
                    className={inputCls} />
                  <span className="text-slate-200 font-bold shrink-0">—</span>
                  <input type="text" inputMode="decimal" placeholder="Max"
                    value={localState[maxKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(maxKey, e.target.value !== '' ? e.target.value : undefined)}
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
            ] as [string, string, string][]).map(([label, minKey, maxKey]) => (
              <div key={label} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min"
                    value={localState[minKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(minKey, e.target.value !== '' ? e.target.value : undefined)}
                    className={inputCls} />
                  <span className="text-slate-200 font-bold shrink-0">—</span>
                  <input type="text" inputMode="decimal" placeholder="Max"
                    value={localState[maxKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(maxKey, e.target.value !== '' ? e.target.value : undefined)}
                    className={inputCls} />
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <label className={labelCls}>Plastic</label>
              <MultiSelectDropdown
                label="Plastic"
                options={plastics}
                selectedValues={(localState.plastic as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('plastic', vals.length ? vals.join(',') : undefined)}
                placeholder="All Plastics"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Color</label>
              <MultiSelectDropdown
                label="Color"
                options={colors}
                selectedValues={(localState.color as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('color', vals.length ? vals.join(',') : undefined)}
                placeholder="All Colors"
                align="right"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Stamp</label>
              <MultiSelectDropdown
                label="Stamp"
                options={stamps}
                selectedValues={(localState.stamp as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('stamp', vals.length ? vals.join(',') : undefined)}
                placeholder="All Stamps"
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Stamp Foil</label>
              <MultiSelectDropdown
                label="Foil"
                options={stampFoils}
                selectedValues={(localState.stampFoil as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('stampFoil', vals.length ? vals.join(',') : undefined)}
                placeholder="All Foils"
                align="right"
              />
            </div>

            {/* Location tree picker */}
            {availableLocations.length > 0 && (
              <div className="space-y-2 col-span-2">
                <label className={labelCls}>Location</label>
                {(localState.locations ? localState.locations.split(',').filter(Boolean) : []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {(localState.locations ? localState.locations.split(',').filter(Boolean) : []).map((loc: string) => (
                      <span key={loc} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg">
                        {loc.split('/').pop()}
                        <button type="button" onClick={() => {
                          const next = (localState.locations ? localState.locations.split(',').filter(Boolean) : []).filter((l: string) => l !== loc)
                          setLocalState(prev => ({ ...prev, locations: next.length ? next.join(',') : undefined }))
                        }} className="hover:text-indigo-900">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <LocationTreePicker
                  availableLocations={availableLocations}
                  selectedLocations={(localState.locations ? localState.locations.split(',').filter(Boolean) : [])}
                  onChange={(locs) => setLocalState(prev => ({ ...prev, locations: locs.length ? locs.join(',') : undefined }))}
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
                  (localState.ink || 'any') === option 
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
        <button onClick={() => { setLocalState({}); onClose(); }}
          className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
          <RotateCcw className="w-4 h-4" />
          Cancel
        </button>
        <button onClick={applyFilters}
          className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100">
          Add to Search
        </button>
      </div>
    </div>
  )
}
