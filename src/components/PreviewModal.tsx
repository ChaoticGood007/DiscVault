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

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import DiscPreview from './DiscPreview'
import { useEffect } from 'react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  disc: {
    mold: {
      name: string
      brand: string
    }
    color?: string | null
    secondaryColor?: string | null
    secondaryPattern?: string | null
    stampFoil?: string | null
    plastic?: string | null
    weight?: number | null
  }
}

export default function PreviewModal({ isOpen, onClose, disc }: PreviewModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="relative">
                  <DiscPreview
                    color={disc.color}
                    secondaryColor={disc.secondaryColor}
                    secondaryPattern={disc.secondaryPattern}
                    stampFoil={disc.stampFoil}
                    size={280}
                    className="drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)]"
                    hoverScale={1.05}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">{disc.mold.brand}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{disc.plastic}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{disc.mold.name}</h2>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {disc.weight}g
                  </div>
                  {disc.secondaryPattern && (
                    <div className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      {disc.secondaryPattern} Pattern
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex justify-center">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
