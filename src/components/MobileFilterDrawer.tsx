'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X, Check, RotateCcw, SlidersHorizontal, Package, Tag, Layers, Filter } from 'lucide-react'
import { type AdvancedFilters, ADVANCED_KEYS } from './AdvancedSearch'
import dynamic from 'next/dynamic'
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
  currentCategory?: string
  currentBrand?: string
  currentBag?: string
  bagOptions: { label: string, value: string }[]
  advancedFilters: AdvancedFilters
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
  currentCategory,
  currentBrand,
  currentBag,
  bagOptions,
  advancedFilters,
}: MobileFilterDrawerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [localCategory, setLocalCategory] = useState<string | undefined>(currentCategory)
  const [localBrand, setLocalBrand] = useState<string | undefined>(currentBrand)
  const [localBag, setLocalBag] = useState<string | undefined>(currentBag)
  const [localAdvanced, setLocalAdvanced] = useState<AdvancedFilters>(advancedFilters)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setLocalCategory(currentCategory)
      setLocalBrand(currentBrand)
      setLocalBag(currentBag)
      setLocalAdvanced(advancedFilters)
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

  const handleUpdateAdvanced = (key: keyof AdvancedFilters, value: string | number | undefined) => {
    setLocalAdvanced(prev => ({ ...prev, [key]: value }))
  }

  const selectedLocations = localAdvanced.locations ? localAdvanced.locations.split(',').filter(Boolean) : []

  const toggleLocation = (loc: string) => {
    const next = selectedLocations.includes(loc)
      ? selectedLocations.filter(l => l !== loc)
      : [...selectedLocations, loc]
    setLocalAdvanced(prev => ({ ...prev, locations: next.length ? next.join(',') : undefined }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (localCategory) params.set('category', localCategory)
    else params.delete('category')
      
    if (localBrand) params.set('brand', localBrand)
    else params.delete('brand')

    if (localBag) params.set('inBag', localBag)
    else params.delete('inBag')

    ADVANCED_KEYS.forEach(key => {
      const val = localAdvanced[key]
      if (val !== undefined && val !== '') {
        params.set(key, val.toString())
      } else {
        params.delete(key)
      }
    })

    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
    onClose()
  }

  const resetFilters = () => {
    setLocalCategory(undefined)
    setLocalBrand(undefined)
    setLocalBag(undefined)
    setLocalAdvanced({})
  }

  const activeCount = 
    (localCategory ? 1 : 0) + 
    (localBrand ? 1 : 0) + 
    (localBag ? 1 : 0) + 
    Object.values(localAdvanced).filter(v => v !== undefined && v !== '').length

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-50 sm:hidden animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-indigo-600">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-black text-slate-900">Filters</h2>
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
        {/* Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-200 pb-2">
            <Package className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Bag Select</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLocalBag(localBag === 'true' ? undefined : 'true')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${localBag === 'true' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-600'}`}
            >
              <span className="text-xs font-bold">All Bags</span>
              {localBag === 'true' && <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLocalBag(localBag === 'false' ? undefined : 'false')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${localBag === 'false' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-600'}`}
            >
              <span className="text-xs font-bold">No Bag</span>
              {localBag === 'false' && <Check className="w-4 h-4" />}
            </button>
            {bagOptions.map(bag => (
              <button
                key={bag.value}
                onClick={() => setLocalBag(localBag === bag.value ? undefined : bag.value)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${localBag === bag.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-600'}`}
              >
                <span className="text-xs font-bold truncate pr-2">{bag.label.split(' / ').pop()}</span>
                {localBag === bag.value && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 mb-4 border-b border-slate-200 pb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Category</span>
          </div>
          <MultiSelectDropdown
            label="Category"
            options={categories}
            selectedValues={localCategory ? localCategory.split(',').filter(Boolean) : []}
            onChange={(vals) => setLocalCategory(vals.length ? vals.join(',') : undefined)}
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
            selectedValues={localBrand ? localBrand.split(',').filter(Boolean) : []}
            onChange={(vals) => setLocalBrand(vals.length ? vals.join(',') : undefined)}
            placeholder="All Brands"
          />
        </div>

        {/* Location Tree Picker */}
        {availableLocations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 mb-2 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Location</span>
              {selectedLocations.length > 0 && (
                <span className="ml-auto text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {selectedLocations.length} selected
                </span>
              )}
            </div>
            {selectedLocations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedLocations.map(loc => (
                  <span key={loc} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg">
                    {loc.split('/').pop()}
                    <button type="button" onClick={() => {
                      const next = selectedLocations.filter(l => l !== loc)
                      setLocalAdvanced(prev => ({ ...prev, locations: next.length ? next.join(',') : undefined }))
                    }} className="hover:text-indigo-900">×</button>
                  </span>
                ))}
              </div>
            )}
            <LocationTreePicker
              availableLocations={availableLocations}
              selectedLocations={selectedLocations}
              onChange={(locs) => setLocalAdvanced(prev => ({ ...prev, locations: locs.length ? locs.join(',') : undefined }))}
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
            ] as [string, keyof AdvancedFilters, keyof AdvancedFilters][]).map(([label, minKey, maxKey]) => (
              <div key={label} className="space-y-2">
                <label className={labelCls}>{label}</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="decimal" placeholder="Min"
                    value={localAdvanced[minKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdateAdvanced(minKey, e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={inputCls} />
                  <span className="text-slate-300 font-bold shrink-0">—</span>
                  <input type="text" inputMode="decimal" placeholder="Max"
                    value={localAdvanced[maxKey] ?? ''} onKeyDown={allowNumeric}
                    onChange={(e) => handleUpdateAdvanced(maxKey, e.target.value ? parseFloat(e.target.value) : undefined)}
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
                selectedValues={(localAdvanced.plastic as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdateAdvanced('plastic', vals.length ? vals.join(',') : undefined)}
                placeholder="All Plastics"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Color</label>
              <MultiSelectDropdown
                label="Color"
                options={colors}
                selectedValues={(localAdvanced.color as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdateAdvanced('color', vals.length ? vals.join(',') : undefined)}
                placeholder="All Colors"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Stamp</label>
              <MultiSelectDropdown
                label="Stamp"
                options={stamps}
                selectedValues={(localAdvanced.stamp as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdateAdvanced('stamp', vals.length ? vals.join(',') : undefined)}
                placeholder="All Stamps"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Stamp Foil</label>
              <MultiSelectDropdown
                label="Foil"
                options={stampFoils}
                selectedValues={(localAdvanced.stampFoil as string || '').split(',').filter(Boolean)}
                onChange={(vals) => handleUpdateAdvanced('stampFoil', vals.length ? vals.join(',') : undefined)}
                placeholder="All Foils"
              />
            </div>

            {/* Ink status */}
            <div className="space-y-2 col-span-2">
              <label className={labelCls}>Ink Status</label>
              <div className="flex gap-2">
                {['any', 'none', 'exists'].map((option) => (
                  <button key={option}
                    onClick={() => handleUpdateAdvanced('ink', option === 'any' ? undefined : option)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      (localAdvanced.ink || 'any') === option 
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
          Show Results
        </button>
      </div>
    </div>
  )
}
