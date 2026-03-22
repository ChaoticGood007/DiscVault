'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveCategoryColors } from '@/app/actions/settings'
import { Check, Loader2, RotateCcw, Palette } from 'lucide-react'
import { DEFAULT_CATEGORY_COLORS } from '@/lib/constants'

interface CategoryColorEditorProps {
  initialColors: Record<string, string>
  categories: string[]
}

export default function CategoryColorEditor({ initialColors, categories }: CategoryColorEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [colors, setColors] = useState<Record<string, string>>(initialColors)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Merge known categories with any DB-defined categories
  const allCategories = Array.from(new Set([...Object.keys(DEFAULT_CATEGORY_COLORS), ...categories])).sort()

  const handleColorChange = (category: string, color: string) => {
    setColors(prev => ({ ...prev, [category]: color }))
    setSaveStatus('idle')
  }

  const handleSave = () => {
    setSaveStatus('saving')
    startTransition(async () => {
      await saveCategoryColors(colors)
      setSaveStatus('saved')
      router.refresh()
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    })
  }

  const handleReset = () => {
    setColors(DEFAULT_CATEGORY_COLORS)
    setSaveStatus('idle')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCategories.map(cat => (
          <div key={cat} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50">
            <span className="text-sm font-bold text-slate-700 truncate mr-3">{cat}</span>
            <div className="relative shrink-0 flex items-center justify-center">
              <input
                type="color"
                value={colors[cat] || DEFAULT_CATEGORY_COLORS[cat] || '#cbd5e1'}
                onChange={(e) => handleColorChange(cat, e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div 
                className="w-8 h-8 rounded-lg shadow-sm border-2 border-white ring-1 ring-slate-200"
                style={{ backgroundColor: colors[cat] || DEFAULT_CATEGORY_COLORS[cat] || '#cbd5e1' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
        <button
          onClick={handleSave}
          disabled={isPending || saveStatus === 'saved'}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-100"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check className="w-4 h-4" />
          ) : (
            <Palette className="w-4 h-4" />
          )}
          {saveStatus === 'saved' ? 'Saved' : 'Save Colors'}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Defaults
        </button>
      </div>
    </div>
  )
}
