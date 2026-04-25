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

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, CheckCircle2, Circle, PackageCheck, AlertTriangle, Backpack } from 'lucide-react'
import DiscPreview from '@/components/DiscPreview'

interface BagCheckDisc {
  id: string
  moldName: string
  brand: string
  category: string
  speed: number
  glide: number
  turn: number
  fade: number
  plastic: string | null
  weight: number | null
  color: string | null
  secondaryColor: string | null
  secondaryPattern: string | null
  stampFoil: string | null
  location: string | null
}

interface BagOption {
  label: string
  value: string
}

interface BagCheckListProps {
  vaultName: string
  bags: BagOption[]
  discs: BagCheckDisc[]
}

export default function BagCheckList({ vaultName, bags, discs }: BagCheckListProps) {
  const [selectedBag, setSelectedBag] = useState<string | null>(bags.length === 1 ? bags[0].value : null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  // Filter discs to only those in the selected bag (exact match or child location)
  const filteredDiscs = useMemo(() => {
    if (!selectedBag) return []
    return discs.filter(d =>
      d.location === selectedBag || d.location?.startsWith(selectedBag + '/')
    )
  }, [discs, selectedBag])

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const resetAll = () => setChecked(new Set())
  const checkAll = () => setChecked(new Set(filteredDiscs.map(d => d.id)))

  const handleBagChange = (bagValue: string) => {
    setSelectedBag(bagValue)
    setChecked(new Set())
  }

  const checkedCount = filteredDiscs.filter(d => checked.has(d.id)).length
  const totalCount = filteredDiscs.length
  const missingCount = totalCount - checkedCount
  const allChecked = checkedCount === totalCount && totalCount > 0

  // Group discs by sub-location within the selected bag
  const grouped = useMemo(() => {
    const groups: Record<string, BagCheckDisc[]> = {}
    filteredDiscs.forEach(disc => {
      let groupLabel = 'General'
      if (disc.location && selectedBag && disc.location.startsWith(selectedBag + '/')) {
        // Strip the bag prefix to get the sub-location path
        const subPath = disc.location.slice(selectedBag.length + 1)
        // Use only the first level of the sub-path as the group name
        groupLabel = subPath.split('/')[0]
      }
      if (!groups[groupLabel]) groups[groupLabel] = []
      groups[groupLabel].push(disc)
    })
    // Sort each group by speed (desc), then net stability (turn + fade, desc)
    Object.values(groups).forEach(g =>
      g.sort((a, b) => b.speed - a.speed || (b.turn + b.fade) - (a.turn + a.fade))
    )
    return groups
  }, [filteredDiscs, selectedBag])

  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  // No bags configured state
  if (bags.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm text-center space-y-4">
        <div className="inline-flex p-4 bg-slate-100 rounded-2xl">
          <Backpack className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900">No Bags Configured</h2>
        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
          Mark locations as &quot;In Bag&quot; in your vault&apos;s location tree under <span className="font-bold text-slate-700">Settings → Location Tree</span> to use the Bag Check feature.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 block">Bag Check</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{vaultName}</h1>
          </div>
          {selectedBag && (
            <div className="flex gap-2">
              <button
                onClick={checkAll}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-slate-400 hover:text-emerald-600"
                title="Check all"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button
                onClick={resetAll}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition-all text-slate-400 hover:text-amber-600"
                title="Reset all"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Bag Selector */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {bags.map(bag => (
              <button
                key={bag.value}
                onClick={() => handleBagChange(bag.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all border ${
                  selectedBag === bag.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <Backpack className="w-4 h-4" />
                {bag.label}
              </button>
            ))}
          </div>

          {/* Progress Bar — only show when a bag is selected */}
          {selectedBag && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className={`uppercase tracking-widest ${allChecked ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {allChecked ? 'All accounted for!' : `${checkedCount} of ${totalCount} found`}
                </span>
                {!allChecked && missingCount > 0 && checkedCount > 0 && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {missingCount} missing
                  </span>
                )}
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${allChecked ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No bag selected prompt */}
      {!selectedBag && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-10 text-center">
          <Backpack className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Select a bag above to start checking</p>
        </div>
      )}

      {/* All Clear Banner */}
      <AnimatePresence>
        {allChecked && totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="bg-emerald-50 border-2 border-emerald-200 rounded-[24px] p-6 flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-100 rounded-2xl">
              <PackageCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-900">Bag is complete!</h3>
              <p className="text-sm font-medium text-emerald-600">All {totalCount} discs accounted for. You&apos;re good to go.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disc Checklist by Category */}
      {selectedBag && Object.entries(grouped).map(([category, categoryDiscs]) => {
        const catCheckedCount = categoryDiscs.filter(d => checked.has(d.id)).length
        const catAllChecked = catCheckedCount === categoryDiscs.length

        return (
          <div key={category} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Category Header */}
            <div className={`px-6 py-3 border-b transition-colors ${catAllChecked ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${catAllChecked ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {category}
                </span>
                <span className={`text-[10px] font-black ${catAllChecked ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {catCheckedCount}/{categoryDiscs.length}
                </span>
              </div>
            </div>

            {/* Disc Items */}
            <div className="divide-y divide-slate-50">
              {categoryDiscs.map((disc) => {
                const isChecked = checked.has(disc.id)

                return (
                  <motion.button
                    key={disc.id}
                    onClick={() => toggle(disc.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all active:scale-[0.98] ${
                      isChecked
                        ? 'bg-emerald-50/50'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Check Icon */}
                    <div className="shrink-0">
                      <AnimatePresence mode="wait">
                        {isChecked ? (
                          <motion.div
                            key="checked"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unchecked"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Circle className="w-6 h-6 text-slate-300" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Disc Preview */}
                    <div className="shrink-0">
                      <DiscPreview
                        color={disc.color}
                        secondaryColor={disc.secondaryColor}
                        secondaryPattern={disc.secondaryPattern}
                        stampFoil={disc.stampFoil}
                        size={36}
                        hoverScale={1}
                        seed={disc.id}
                      />
                    </div>

                    {/* Disc Info */}
                    <div className={`flex-1 min-w-0 transition-opacity ${isChecked ? 'opacity-50' : 'opacity-100'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${isChecked ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>
                          {disc.moldName}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 truncate">
                        {[disc.brand, disc.plastic, disc.weight ? `${disc.weight}g` : null].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
