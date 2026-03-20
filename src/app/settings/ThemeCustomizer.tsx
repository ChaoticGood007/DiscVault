'use client'

import { useState, useEffect } from 'react'
import { updateAccentColor } from '@/app/actions/settings'
import { generateTailwindPalette } from '@/lib/colors'

export default function ThemeCustomizer({ initialHex }: { initialHex: string }) {
  const [color, setColor] = useState(initialHex)
  const [saving, setSaving] = useState(false)

  // Live CSS injection for instant previews!
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const palette = generateTailwindPalette(color)
      
      // Inject dynamically computed CSS variables into the document scope
      Object.entries(palette).forEach(([variableName, hexValue]) => {
        document.body.style.setProperty(variableName, hexValue)
      })
    }
  }, [color])

  const handleSave = async () => {
    setSaving(true)
    await updateAccentColor(color)
    setTimeout(() => setSaving(false), 800) // Delay to show user feedback state
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer">
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-16 p-0 border-0 rounded-2xl cursor-pointer bg-transparent overflow-hidden shadow-lg opacity-0 absolute inset-0 z-10"
          />
          <div 
            className="w-16 h-16 rounded-2xl shadow-lg border border-slate-200 transition-transform group-active:scale-95" 
            style={{ backgroundColor: color }}
          />
          <div className="absolute inset-0 ring-4 ring-slate-900/5 rounded-2xl pointer-events-none group-hover:ring-slate-900/10 transition-all" />
        </div>
        <div>
          <span className="block text-xl font-black text-slate-900 uppercase tracking-widest">{color}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hex Code</span>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving || color === initialHex}
        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:active:scale-100"
      >
        {saving ? 'Saving...' : color === initialHex ? 'Saved' : 'Save Theme'}
      </button>
    </div>
  )
}
