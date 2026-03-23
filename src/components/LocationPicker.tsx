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

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MapPin, Briefcase, X, Info } from 'lucide-react'
import { flattenTree, type LocationNode, type FlatLocation } from '@/lib/locationTree'

interface LocationPickerProps {
  tree: LocationNode[]
  value: string | null
  onChange: (value: string | null) => void
  className?: string
}

export default function LocationPicker({ tree, value, onChange, className = '' }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const flat = flattenTree(tree)

  const selected = flat.find(f => f.value === value) ?? null

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (loc: FlatLocation | null) => {
    onChange(loc ? loc.value : null)
    setOpen(false)
  }

  // No tree defined — fall back to free text
  if (flat.length === 0) {
    return (
      <input
        type="text"
        defaultValue={value ?? ''}
        name="location"
        placeholder="e.g. Main Bag / Putter Pocket"
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all ${className}`}
      />
    )
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Hidden field so form submission still works */}
      <input type="hidden" name="location" value={value ?? ''} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all outline-none ${
          open
            ? 'border-indigo-200 bg-white ring-2 ring-indigo-100'
            : 'border-slate-200 bg-slate-50 hover:border-indigo-200'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              {selected.inBag && <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              <span className="text-slate-900 truncate">{selected.path}</span>
            </>
          ) : (
            <span className="text-slate-400 font-medium">No location set</span>
          )}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selected && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); select(null) }}
              className="p-0.5 rounded text-slate-300 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transition-all duration-200 ease-out origin-top ${
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="max-h-56 overflow-y-auto p-2 space-y-0.5">
          <button
            type="button"
            onClick={() => select(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
              !value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            No location
          </button>
          {flat.map(loc => (
            <button
              key={loc.value}
              type="button"
              onClick={() => select(loc)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                value === loc.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {loc.inBag
                ? <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                : <span className="w-3.5 h-3.5 shrink-0" />
              }
              <span className="truncate">{loc.path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

