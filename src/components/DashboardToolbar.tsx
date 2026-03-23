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

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, LayoutGrid, List, Columns, Check, Search, Inbox, ChevronDown, Settings, SlidersHorizontal, ArrowUpDown, ArrowDown, ArrowUp, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import AdvancedSearch, { type AdvancedFilters } from './AdvancedSearch'
import MobileFilterDrawer from './MobileFilterDrawer'
import MultiSelectDropdown from './MultiSelectDropdown'

const SORT_OPTIONS = [
  { id: 'createdAt', label: 'Date Added' },
  { id: 'name', label: 'Mold Name' },
  { id: 'brand', label: 'Brand' },
  { id: 'speed', label: 'Speed' },
  { id: 'weight', label: 'Weight' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'color', label: 'Color' },
  { id: 'stamp', label: 'Stamp' },
  { id: 'condition', label: 'Condition' },
]

interface Collection {
  id: string
  name: string
  description: string | null
}

interface DashboardToolbarProps {
  brands: string[]
  categories: string[]
  plastics: string[]
  colors: string[]
  stamps: string[]
  stampFoils: string[]
  collections: Collection[]
  availableLocations: string[]
  currentCollectionIds: string[]
  currentCategory?: string
  currentBrand?: string
  currentView: string
  searchQuery?: string
  currentBag?: string
  bagOptions?: { label: string, value: string }[]
  advancedFilters: AdvancedFilters
  sortBy: string
  sortOrder: string
  visibleColumns: string[]
}

const ALL_COLUMNS = [
  { id: 'inBag', label: 'Bag' },
  { id: 'brand', label: 'Brand' },
  { id: 'name', label: 'Mold' },
  { id: 'category', label: 'Category' },
  { id: 'flight_numbers', label: 'Flight Numbers' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'weight', label: 'Weight' },
  { id: 'color', label: 'Color' },
  { id: 'stamp', label: 'Stamp' },
  { id: 'condition', label: 'Cond' },
  { id: 'ink', label: 'Ink' },
  { id: 'location', label: 'Location' },
  { id: 'notes', label: 'Notes' },
  { id: 'createdAt', label: 'Added' },
]

export default function DashboardToolbar({
  brands,
  categories,
  plastics,
  colors,
  stamps,
  stampFoils,
  collections,
  availableLocations,
  currentCollectionIds,
  currentCategory,
  currentBrand,
  currentView,
  searchQuery,
  currentBag,
  bagOptions = [],
  advancedFilters,
  sortBy,
  sortOrder,
  visibleColumns,
}: DashboardToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [showColSelector, setShowColSelector] = useState(false)
  const [showSortSelector, setShowSortSelector] = useState(false)
  const [showCollectionSelector, setShowCollectionSelector] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showBagSelector, setShowBagSelector] = useState(false)
  const colRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const collectionRef = useRef<HTMLDivElement>(null)
  const advancedRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const bagRef = useRef<HTMLDivElement>(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery || '')

  useEffect(() => {
    setLocalSearch(searchQuery || '')
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colRef.current && !colRef.current.contains(event.target as Node)) {
        setShowColSelector(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortSelector(false)
      }
      if (collectionRef.current && !collectionRef.current.contains(event.target as Node)) {
        setShowCollectionSelector(false)
      }
      if (advancedRef.current && !advancedRef.current.contains(event.target as Node)) {
        setShowAdvanced(false)
      }
      if (bagRef.current && !bagRef.current.contains(event.target as Node)) {
        setShowBagSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    
    if (!updates.page) {
      params.set('page', '1')
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchQuery || '')) {
        updateParams({ search: localSearch || null })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, searchQuery, updateParams])

  const toggleColumn = (colId: string) => {
    let newCols: string[]
    if (visibleColumns.includes(colId)) {
      newCols = visibleColumns.filter(id => id !== colId)
    } else {
      newCols = [...visibleColumns, colId]
    }
    if (newCols.length === 0) return
    document.cookie = `discVaultVisibleCols=${newCols.join(',')}; path=/; max-age=31536000`
    updateParams({ cols: newCols.join(',') })
  }

  const toggleCollectionId = (id: string) => {
    let newIds: string[]
    if (currentCollectionIds.includes(id)) {
      newIds = currentCollectionIds.filter(cid => cid !== id)
    } else {
      newIds = [...currentCollectionIds, id]
    }
    updateParams({ collections: newIds.length > 0 ? newIds.join(',') : null })
  }

  const activeAdvancedCount = Object.values(advancedFilters).filter(v => v !== undefined && v !== '').length
  
  const currentCategoryArray = currentCategory ? currentCategory.split(',').filter(Boolean) : []
  const currentBrandArray = currentBrand ? currentBrand.split(',').filter(Boolean) : []
  
  const activeFilterCount = currentCategoryArray.length + currentBrandArray.length + (currentBag ? 1 : 0) + activeAdvancedCount
  const isAllMode = pathname === '/v/all'

  return (
    <div className="space-y-4">
      {/* Collection Multi-Select Filter Bar - Only shown in 'All' mode */}
      {isAllMode && (
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative" ref={collectionRef}>
            <button 
              onClick={() => setShowCollectionSelector(!showCollectionSelector)}
              className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all active:scale-95 group"
            >
              <div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Inbox className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left pr-4">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Filtering Vaults</span>
                <span className="block font-black text-slate-900 leading-none">
                  {currentCollectionIds.length === 0 ? 'All Collections' : 
                   currentCollectionIds.length === 1 ? (collections.find(c => c.id === currentCollectionIds[0])?.name || '1 Vault Selected') : 
                   `${currentCollectionIds.length} Vaults Selected`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showCollectionSelector ? 'rotate-180' : ''}`} />
            </button>

              <div className={`absolute top-full left-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-[100] transition-all duration-300 ease-out origin-top-left ${
                showCollectionSelector 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              }`}>
                <div className="px-4 py-3 mb-2 border-b border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Vaults</span>
                  <Link href="/" className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>
                <button
                  onClick={() => { updateParams({ collections: null }); setShowCollectionSelector(false); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group ${currentCollectionIds.length === 0 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <span className="font-bold text-sm">All Inventory</span>
                  {currentCollectionIds.length === 0 && <Check className="w-4 h-4" />}
                </button>
                <div className="max-h-64 overflow-y-auto mt-1 space-y-1">
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => toggleCollectionId(col.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between group ${currentCollectionIds.includes(col.id) ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{col.name}</span>
                      </div>
                      {currentCollectionIds.includes(col.id) && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50">
                  <Link
                    href="/"
                    className="flex items-center justify-center w-full py-3 text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    + Switch Vaults
                  </Link>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-3 md:gap-4 justify-between relative z-40">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center text-slate-400 mr-2 shrink-0">
            <Filter className="h-5 w-5 mr-2" />
            <span className="font-bold text-[10px] uppercase tracking-widest hidden md:inline">Filter</span>
          </div>
          
          <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-64">
            <input
              type="text"
              id="toolbar-search"
              placeholder="Search discs..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-black focus:ring-4 focus:ring-indigo-100 outline-none bg-slate-50 text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="relative" ref={bagRef}>
              <button
                onClick={() => setShowBagSelector(!showBagSelector)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 flex items-center gap-2 shrink-0 ${currentBag ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'}`}
              >
                {currentBag === 'true' ? 'All Bags' : 
                 currentBag === 'false' ? 'No Bag' : 
                 currentBag ? bagOptions.find(b => b.value === currentBag)?.label?.split('/').pop() || 'Bag' : 
                 'Bags'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBagSelector ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 transition-all origin-top ${showBagSelector ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <button
                  onClick={() => { updateParams({ inBag: null }); setShowBagSelector(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${!currentBag ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Clear Bag Filter
                </button>
                <button
                  onClick={() => { updateParams({ inBag: 'true' }); setShowBagSelector(false); }}
                  className={`w-full flex items-center gap-2 text-left px-4 py-2 text-sm font-bold transition-colors ${currentBag === 'true' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  All Bags
                </button>
                <button
                  onClick={() => { updateParams({ inBag: 'false' }); setShowBagSelector(false); }}
                  className={`w-full flex items-center gap-2 text-left px-4 py-2 text-sm font-bold transition-colors ${currentBag === 'false' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="w-3.5 h-3.5 border-2 border-slate-300 rounded inline-block" />
                  No Bag
                </button>
                {bagOptions.length > 0 && <div className="my-1 border-t border-slate-100" />}
                {bagOptions.map(bag => (
                  <button
                    key={bag.value}
                    onClick={() => { updateParams({ inBag: bag.value }); setShowBagSelector(false); }}
                    className={`w-full truncate text-left px-4 py-2 text-sm font-bold transition-colors ${currentBag === bag.value ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    title={bag.label}
                  >
                    {bag.label.split(' / ').pop()}
                  </button>
                ))}
              </div>
            </div>

          <div className="relative" ref={advancedRef}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 flex items-center gap-2 shrink-0 ${showAdvanced || activeAdvancedCount > 0 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Advanced
              {activeAdvancedCount > 0 && (
                <span className="bg-white text-indigo-600 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black">
                  {activeAdvancedCount}
                </span>
              )}
            </button>

            {showAdvanced && (
              <AdvancedSearch 
                filters={advancedFilters}
                availableLocations={availableLocations}
                plastics={plastics}
                colors={colors}
                stamps={stamps}
                stampFoils={stampFoils}
                onClose={() => setShowAdvanced(false)} 
              />
            )}
          </div>
          
          <div className="w-32 hidden lg:block">
            <MultiSelectDropdown
              label="Category"
              options={categories}
              selectedValues={currentCategoryArray}
              onChange={(vals) => updateParams({ category: vals.length ? vals.join(',') : null })}
              placeholder="Categories"
            />
          </div>

          <div className="w-32 hidden lg:block">
            <MultiSelectDropdown
              label="Brand"
              options={brands}
              selectedValues={currentBrandArray}
              onChange={(vals) => updateParams({ brand: vals.length ? vals.join(',') : null })}
              placeholder="Brands"
            />
          </div>
          </div>

          <button
            onClick={() => setShowMobileDrawer(true)}
            className={`sm:hidden px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 flex items-center gap-2 shrink-0 ${
              activeFilterCount > 0 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-indigo-600 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>




        <div className="flex items-center gap-3 ml-auto lg:ml-0">
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortSelector(!showSortSelector)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${showSortSelector ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}
              title="Sort Inventory"
            >
              <ArrowUpDown className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-widest px-1 hidden sm:inline-block">Sort</span>
            </button>

            <div className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 grid grid-cols-1 gap-1 z-[110] transition-all duration-300 ease-out origin-top-right ${
              showSortSelector 
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
            }`}>
              <div className="px-3 py-2 mb-1 border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</span>
              </div>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (isActive) {
                        updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })
                      } else {
                        updateParams({ sortBy: opt.id, sortOrder: opt.id === 'createdAt' || opt.id === 'speed' || opt.id === 'condition' || opt.id === 'weight' ? 'desc' : 'asc' })
                      }
                      setShowSortSelector(false)
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group hover:bg-slate-50`}
                  >
                    <span className={`text-sm font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {opt.label}
                    </span>
                    {isActive && (
                      <div className="flex items-center text-indigo-600">
                        {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative" ref={colRef}>
            <button
              onClick={() => setShowColSelector(!showColSelector)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${showColSelector ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}
            >
              <Columns className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-widest px-1">{currentView === 'cards' ? 'Fields' : 'Columns'}</span>
            </button>

              <div className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 grid grid-cols-1 gap-1 z-[110] transition-all duration-300 ease-out origin-top-right ${
                showColSelector 
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              }`}>
                <div className="px-3 py-2 mb-1 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Visible {currentView === 'cards' ? 'Fields' : 'Columns'}</span>
                </div>
                {ALL_COLUMNS.map((col) => {
                  const isLocked = col.id === 'name'
                  return (
                    <button
                      key={col.id}
                      onClick={() => !isLocked && toggleColumn(col.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${isLocked ? 'cursor-default opacity-60' : 'hover:bg-slate-50'}`}
                    >
                      <span className={`text-sm font-bold ${visibleColumns.includes(col.id) ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {col.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isLocked && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Required</span>}
                        {visibleColumns.includes(col.id) && <Check className="h-4 w-4 text-indigo-600" />}
                      </div>
                    </button>
                  )
                })}
              </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <Link 
              href={`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), view: 'cards'}).toString()}`}
              className={`p-2 rounded-lg transition-all ${currentView === 'cards' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </Link>
            <Link 
              href={`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams.entries()), view: 'list'}).toString()}`}
              className={`p-2 rounded-lg transition-all ${currentView === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <MobileFilterDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        categories={categories}
        brands={brands}
        plastics={plastics}
        colors={colors}
        stamps={stamps}
        stampFoils={stampFoils}
        availableLocations={availableLocations}
        currentCategory={currentCategory}
        currentBrand={currentBrand}
        currentBag={currentBag}
        bagOptions={bagOptions}
        advancedFilters={advancedFilters}
      />
    </div>
  )
}
