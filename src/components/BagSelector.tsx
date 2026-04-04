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

import Link from 'next/link'
import { Briefcase, ShoppingBag, Box, ChevronRight, LayoutGrid } from 'lucide-react'
import { motion } from 'framer-motion'

interface BagInfo {
  name: string
  path: string
  count: number
  isInBag: boolean
}

interface BagSelectorProps {
  bags: BagInfo[]
  baseUrl: string
  showAll?: boolean
  onToggleAll?: () => void
}

export default function BagSelector({ bags, baseUrl, showAll, onToggleAll }: BagSelectorProps) {
  const filteredBags = showAll ? bags : bags.filter(b => b.isInBag)
  const hasHiddenBags = bags.some(b => !b.isInBag)

  return (
    <div className="max-w-4xl mx-auto w-full py-8 px-4">
      <div className="text-center mb-12">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Select a bag</h2>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Flight Analysis</h1>
        <p className="mt-4 text-slate-500 text-sm max-w-md mx-auto">
          Choose a bag or storage location to view its flight characteristics and distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBags.map((bag, idx) => (
          <motion.div
            key={bag.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link 
              href={`${baseUrl}?location=${encodeURIComponent(bag.path)}`}
              className="group relative bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start h-full"
            >
              <div className={`p-4 rounded-2xl mb-4 transition-colors ${bag.isInBag ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-200'}`}>
                {bag.isInBag ? <ShoppingBag className="w-6 h-6" /> : <Box className="w-6 h-6" />}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{bag.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{bag.count} Discs</p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                Analyze Path <ChevronRight className="w-3 h-3" />
              </div>

              {/* Selection indicator decoration */}
              <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-slate-100 group-hover:bg-indigo-400 transition-colors" />
            </Link>
          </motion.div>
        ))}

        {/* View All Toggle - Special Card */}
        {hasHiddenBags && (
          <motion.button
            onClick={onToggleAll}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filteredBags.length * 0.05 }}
            className="group p-6 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-center gap-3 h-full min-h-[160px]"
          >
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                {showAll ? 'Show Only Bags' : 'Show All Locations'}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {showAll ? 'Hide storage/shelf locations' : 'Include storage and shelf boxes'}
              </p>
            </div>
          </motion.button>
        )}
      </div>

      {bags.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900">No locations found</h3>
          <p className="text-sm text-slate-500 mt-2">Add some locations to your vault settings to start analyzing your bags.</p>
        </div>
      )}
    </div>
  )
}
