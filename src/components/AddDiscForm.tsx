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
import { Search, Loader2 } from 'lucide-react'
import LocationPicker, { InBagField } from '@/components/LocationPicker'
import { resolveInBag, type LocationNode } from '@/lib/locationTree'

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
  const autoInBag = selectedLocation ? resolveInBag(selectedLocation, tree) : null

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

          {isSearching && molds.length > 0 && (
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
            </ul>
          )}
        </div>
        <input type="hidden" name="moldId" value={selectedMold?.id || ''} required />
        <input type="hidden" name="collectionId" value={vaultId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Weight (g)</label>
          <input
            type="number"
            step="0.1"
            name="weight"
            placeholder="175"
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Plastic</label>
          <input
            type="text"
            name="plastic"
            placeholder="Star, Champion..."
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Color</label>
          <input
            type="text"
            name="color"
            placeholder="Blue, Pink..."
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Stamp</label>
          <input
            type="text"
            name="stamp"
            placeholder="Stock, Tournament..."
            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Stamp Foil</label>
          <input
            type="text"
            name="stampFoil"
            placeholder="Gold, Silver, Holo..."
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
        <div className="flex items-center pb-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">In Bag</label>
            <InBagField autoInBag={autoInBag} defaultChecked={false} />
          </div>
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
        disabled={!selectedMold}
        className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center text-lg"
      >
        Add to Vault
      </button>
    </form>
  )
}
