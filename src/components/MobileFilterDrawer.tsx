'use client'

import { useState, useEffect } from 'react'
import { X, RotateCcw, SlidersHorizontal, Package, Tag, Layers, Filter } from 'lucide-react'
import dynamic from 'next/dynamic'
import { extractSearchTokens } from '@/lib/searchParser'
import MultiSelectDropdown from './MultiSelectDropdown'
const LocationTreePicker = dynamic(() => import('./LocationTreePicker'), { ssr: false })

interface MobileFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  brands: string[]
  plastics: string[]
  colors: string[]
  stamps: string[]
  stampFoils: string[]
  availableLocations: string[]
  initialQuery?: string
  onAppendSearch: (str: string) => void
}

const allowNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','-','.'].includes(e.key)) return
  if (!/[\d]/.test(e.key)) e.preventDefault()
}

const inputCls = "w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-900 placeholder:text-slate-300 placeholder:font-medium shadow-sm"
const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-widest"

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  brands,
  plastics,
  colors,
  stamps,
  stampFoils,
  availableLocations,
  initialQuery,
  onAppendSearch
}: MobileFilterDrawerProps) {
  const [localState, setLocalState] = useState<Record<string, any>>({})
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setLocalState(extractSearchTokens(initialQuery || ''))
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

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

  const resetFilters = () => {
    setLocalState({})
  }

  const activeCount = Object.keys(localState).length

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-50 sm:hidden animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-black text-slate-900">Query Builder</h2>
          {activeCount > 0 && (
            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-black">
              {activeCount} Active
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-200 pb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Category</span>
          </div>
          <MultiSelectDropdown
            label="Category"
            options={categories}
            selectedValues={(localState.category || '').split(',').filter(Boolean)}
            onChange={(vals) => handleUpdate('category', vals.length ? vals.join(',') : undefined)}
            placeholder="All Categories"
          />
        </div>

        {/* Brands */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-200 pb-2">
            <Tag className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Brand</span>
          </div>
          <MultiSelectDropdown
            label="Brand"
            options={brands}
            selectedValues={(localState.brand || '').split(',').filter(Boolean)}
            onChange={(vals) => handleUpdate('brand', vals.length ? vals.join(',') : undefined)}
            placeholder="All Brands"
          />
        </div>

        {/* Location Tree Picker */}
        {availableLocations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 mb-2 border-b border-slate-200 pb-2">
              <Package className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Location</span>
              {(localState.locations ? localState.locations.split(',').filter(Boolean) : []).length > 0 && (
                <span className="ml-auto text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {(localState.locations ? localState.locations.split(',').filter(Boolean) : []).length} selected
                </span>
              )}
            </div>
            {(localState.locations ? localState.locations.split(',').filter(Boolean) : []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(localState.locations ? localState.locations.split(',').filter(Boolean) : []).map((loc: string) => (
                  <span key={loc} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg">
                    {loc.split('/').pop()}
                    <button type="button" onClick={() => {
                      const next = (localState.locations ? localState.locations.split(',').filter(Boolean) : []).filter((l: string) => l !== loc)
                      handleUpdate('locations', next.length ? next.join(',') : undefined)
                    }} className="hover:text-indigo-900">×</button>
                  </span>
                ))}
              </div>
            )}
            <LocationTreePicker
              availableLocations={availableLocations}
              selectedLocations={(localState.locations ? localState.locations.split(',').filter(Boolean) : [])}
              onChange={(locs) => handleUpdate('locations', locs.length ? locs.join(',') : undefined)}
              className="shadow-sm"
            />
          </div>
        )}

        {/* Advanced Numeric Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-200 pb-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Advanced Limits</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {([
              ['Speed', 'minSpeed', 'maxSpeed'],
              ['Glide', 'minGlide', 'maxGlide'],
              ['Turn', 'minTurn', 'maxTurn'],
              ['Fade', 'minFade', 'maxFade'],
              ['Weight (g)', 'minWeight', 'maxWeight'],
              ['Condition', 'minCond', 'maxCond'],
            ] as [string, string, string][]).map(([label, minKey, maxKey]) => (
              <div key={label} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min"
                    value={localState[minKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(minKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                  <span className="text-slate-300 font-bold shrink-0">—</span>
                  <input type="text" inputMode="decimal" placeholder="Max"
                    value={localState[maxKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdate(maxKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                </div>
              </div>
            ))}

            {/* Text filters */}
            <div className="space-y-2 col-span-2 mt-2">
              <label className={labelCls}>Plastic</label>
              <MultiSelectDropdown
                label="Plastic"
                options={plastics}
                selectedValues={(localState.plastic as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('plastic', vals.length ? vals.join(',') : undefined)}
                placeholder="All Plastics"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Color</label>
              <MultiSelectDropdown
                label="Color"
                options={colors}
                selectedValues={(localState.color as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('color', vals.length ? vals.join(',') : undefined)}
                placeholder="All Colors"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Stamp</label>
              <MultiSelectDropdown
                label="Stamp"
                options={stamps}
                selectedValues={(localState.stamp as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('stamp', vals.length ? vals.join(',') : undefined)}
                placeholder="All Stamps"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Stamp Foil</label>
              <MultiSelectDropdown
                label="Foil"
                options={stampFoils}
                selectedValues={(localState.stampFoil as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdate('stampFoil', vals.length ? vals.join(',') : undefined)}
                placeholder="All Foils"
              />
            </div>

            {/* Ink status */}
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Ink Status</label>
              <div className="flex gap-2">
                {['any', 'none', 'exists'].map((option) => (
                  <button key={option}
                    onClick={() => handleUpdate('ink', option === 'any' ? undefined : option)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
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
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex gap-3 z-20 pb-safe">
        <button onClick={resetFilters}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 border border-slate-200">
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
        <button onClick={applyFilters}
          className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200">
          Add to Search
        </button>
      </div>
    </div>
  )
}
