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

import { useState, useEffect, useCallback } from 'react'
import { addDisc } from '@/app/actions/inventory'
import { createCustomMold } from '@/app/actions/molds'
import { Search, Loader2, Plus } from 'lucide-react'
import LocationPicker from '@/components/LocationPicker'
import { type LocationNode } from '@/lib/locationTree'
import { SECONDARY_PATTERN_LABELS } from '@/lib/constants'
import ColorInput from './ColorInput'
import DiscPreview from './DiscPreview'

interface Mold {
  id: string
  name: string
  brand: string
  category: string
}

interface AddDiscFormProps {
  vaultId: string
  tree: LocationNode[]
}

export default function AddDiscForm({ vaultId, tree }: AddDiscFormProps) {
  const [query, setQuery] = useState('')
  const [molds, setMolds] = useState<Mold[]>([])
  const [selectedMold, setSelectedMold] = useState<Mold | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [isCreatingCustom, setIsCreatingCustom] = useState(false)

  // Preview State
  const [previewState, setPreviewState] = useState({
    color: '',
    colorHex: null as string | null,
    secondaryColor: '',
    secondaryColorHex: null as string | null,
    secondaryPattern: '',
    stampFoil: '',
    weight: '',
    plastic: ''
  })

  const handleCreateCustomMold = async () => {
    const brandInput = document.querySelector('input[name="customBrand"]') as HTMLInputElement
    const nameInput = document.querySelector('input[name="customName"]') as HTMLInputElement
    const categoryInput = document.querySelector('select[name="customCategory"]') as HTMLSelectElement
    const speedInput = document.querySelector('input[name="customSpeed"]') as HTMLInputElement
    const glideInput = document.querySelector('input[name="customGlide"]') as HTMLInputElement
    const turnInput = document.querySelector('input[name="customTurn"]') as HTMLInputElement
    const fadeInput = document.querySelector('input[name="customFade"]') as HTMLInputElement

    if (!brandInput.value || !nameInput.value || !speedInput.value || !glideInput.value || !turnInput.value || !fadeInput.value) {
      alert("Please fill out all custom mold fields")
      return
    }

    setIsCreatingCustom(true)
    const formData = new FormData()
    formData.append('brand', brandInput.value)
    formData.append('name', nameInput.value)
    formData.append('category', categoryInput.value)
    formData.append('speed', speedInput.value)
    formData.append('glide', glideInput.value)
    formData.append('turn', turnInput.value)
    formData.append('fade', fadeInput.value)

    try {
      const newMold = await createCustomMold(formData)
      handleSelectMold({
        id: newMold.id,
        name: newMold.name,
        brand: newMold.brand,
        category: newMold.category
      })
      setIsCustomMode(false)
    } catch (e) {
      console.error(e)
      alert("Failed to create custom mold")
    } finally {
      setIsCreatingCustom(false)
    }
  }

  const searchMolds = useCallback(async (q: string) => {
    if (q.length < 2) {
      setMolds([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/molds?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setMolds(data)
    } catch (error) {
      console.error('Failed to fetch molds', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && !selectedMold) {
        searchMolds(query)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, searchMolds, selectedMold])

  const handleSelectMold = (mold: Mold) => {
    setSelectedMold(mold)
    setQuery(`${mold.brand} ${mold.name}`)
    setMolds([])
    setIsSearching(false)
  }

  return (
    <form action={addDisc} className="space-y-6 bg-white p-10 rounded-[40px] shadow-2xl shadow-indigo-50 border border-slate-100 max-w-2xl mx-auto">
      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Find Mold</label>
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (selectedMold) setSelectedMold(null)
                setIsSearching(true)
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Search by name or brand (e.g. Innova Aviar)"
              className="w-full pl-12 pr-4 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 placeholder:font-bold shadow-sm"
              required
            />
            <Search className="absolute left-4 top-5 h-6 w-6 text-slate-300" />
            {loading && <Loader2 className="absolute right-4 top-5 h-6 w-6 text-indigo-500 animate-spin" />}
          </div>

          {isSearching && (
            <ul className="absolute z-10 w-full mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl max-h-64 overflow-auto py-2 p-2">
              {molds.map((mold) => (
                <li
                  key={mold.id}
                  onClick={() => handleSelectMold(mold)}
                  className="px-5 py-4 hover:bg-indigo-50 cursor-pointer flex flex-col transition-all rounded-2xl mb-1 last:mb-0"
                >
                  <span className="font-black text-slate-900">{mold.name}</span>
                  <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{mold.brand} • {mold.category}</span>
                </li>
              ))}
              <li
                onClick={() => {
                  setIsCustomMode(true)
                  setSelectedMold(null)
                  setIsSearching(false)
                }}
                className="px-5 py-4 hover:bg-slate-50 cursor-pointer flex items-center justify-center transition-all rounded-2xl border-2 border-dashed border-slate-200 mt-2 text-slate-500 font-bold gap-2"
              >
                <Plus className="h-4 w-4" /> Not finding your disc? Create Custom Mold
              </li>
            </ul>
          )}
        </div>
        <input type="hidden" name="moldId" value={selectedMold?.id || ''} required={!isCustomMode} />
        <input type="hidden" name="collectionId" value={vaultId} />
      </div>

      {isCustomMode && !selectedMold && (
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-500" /> Create Custom Mold
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Brand</label>
              <input type="text" name="customBrand" className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm" placeholder="e.g. Innova" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
              <input type="text" name="customName" className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm" placeholder="e.g. Destroyer" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
            <select name="customCategory" className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm">
              <option value="Distance Driver">Distance Driver</option>
              <option value="Control Driver">Control Driver</option>
              <option value="Midrange">Midrange</option>
              <option value="Putter">Putter</option>
              <option value="Approach Discs">Approach Discs</option>
            </select>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Speed</label>
              <input type="number" step="0.5" name="customSpeed" className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm" placeholder="12" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Glide</label>
              <input type="number" step="0.5" name="customGlide" className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm" placeholder="5" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Turn</label>
              <input type="number" step="0.5" name="customTurn" className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm" placeholder="-1" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fade</label>
              <input type="number" step="0.5" name="customFade" className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm" placeholder="3" />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleCreateCustomMold}
              disabled={isCreatingCustom}
              className="flex-1 bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-900 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
            >
              {isCreatingCustom ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Custom Mold'}
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className="px-6 text-slate-500 font-black py-4 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-50">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Weight (g)</label>
          <input
            type="number"
            step="0.1"
            name="weight"
            placeholder="175"
            onChange={e => setPreviewState(s => ({ ...s, weight: e.target.value }))}
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Plastic</label>
          <input
            type="text"
            name="plastic"
            placeholder="Star, Champion..."
            onChange={e => setPreviewState(s => ({ ...s, plastic: e.target.value }))}
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Location</label>
          <LocationPicker
            tree={tree}
            value={selectedLocation}
            onChange={(val) => setSelectedLocation(val)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-40">
        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ColorInput 
              name="color" 
              label="Color" 
              onChange={(text, hex) => setPreviewState(s => ({ ...s, color: text, colorHex: hex }))} 
            />
            <ColorInput 
              name="secondaryColor" 
              label="Sec. Color" 
              onChange={(text, hex) => setPreviewState(s => ({ ...s, secondaryColor: text, secondaryColorHex: hex }))} 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Sec. Pattern</label>
              <select
                name="secondaryPattern"
                onChange={e => setPreviewState(s => ({ ...s, secondaryPattern: e.target.value }))}
                className="w-full px-3 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              >
                <option value="">None</option>
                {Object.entries(SECONDARY_PATTERN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Stamp</label>
              <input
                type="text"
                name="stamp"
                placeholder="Stock, Tournament..."
                className="w-full px-3 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Stamp Foil</label>
              <input
                type="text"
                name="stampFoil"
                placeholder="Gold, Silver, Holo..."
                onChange={e => setPreviewState(s => ({ ...s, stampFoil: e.target.value }))}
                className="w-full px-3 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="flex justify-center items-center bg-slate-50 rounded-3xl border border-slate-200 p-6 md:p-4 md:col-span-1 min-h-[200px]">
          {selectedMold || isCustomMode ? (
            <DiscPreview
              color={previewState.color}
              colorHex={previewState.colorHex}
              secondaryColor={previewState.secondaryColor}
              secondaryColorHex={previewState.secondaryColorHex}
              secondaryPattern={previewState.secondaryPattern}
              stampFoil={previewState.stampFoil}
              size={120}
              hoverScale={1}
              className="w-full max-w-[160px] h-auto drop-shadow-xl"
            />
          ) : (
            <div className="text-center space-y-2">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-300 mx-auto opacity-50 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-xs">Preview</span>
              </div>
              <p className="text-xs text-slate-400 font-bold px-4">Select a mold to see preview</p>
            </div>
          )}
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Condition (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            name="condition"
            placeholder="10"
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Ink</label>
          <select
            name="ink"
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
          >
            <option value="None">None</option>
            <option value="Rim">Rim</option>
            <option value="Flight Plate">Flight Plate</option>
            <option value="Both">Both</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Flight characteristics, condition, etc."
          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none resize-none shadow-sm"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={!selectedMold && !isCustomMode}
        className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center text-lg"
      >
        Add to Vault
      </button>
    </form>
  )
}
