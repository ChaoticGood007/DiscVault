'use client'

import { useState, useEffect, useRef } from 'react'
import { parseDiscColor } from '@/lib/colorParser'
import tinycolor from 'tinycolor2'

interface ColorInputProps {
  name: string
  label: string
  initialText?: string | null
  initialHex?: string | null
  onChange?: (text: string, hex8: string | null) => void
}

export default function ColorInput({ name, label, initialText, initialHex, onChange }: ColorInputProps) {
  const [text, setText] = useState(initialText || '')
  
  // Track if the user has manually touched the color or opacity controls
  const [isOverridden, setIsOverridden] = useState(!!initialHex)

  // Derive initial internal states
  const [hex, setHex] = useState(() => {
    if (initialHex) return initialHex.slice(0, 7)
    return tinycolor(parseDiscColor(initialText || '')).toHexString()
  })
  
  const [opacity, setOpacity] = useState(() => {
    if (initialHex && initialHex.length === 9) {
      return parseInt(initialHex.slice(7, 9), 16) / 255
    }
    if (initialHex) return 1
    return tinycolor(parseDiscColor(initialText || '')).getAlpha()
  })

  // When text changes (and not overridden), auto-update the swatch and opacity
  useEffect(() => {
    if (!isOverridden) {
      const parsed = tinycolor(parseDiscColor(text))
      setHex(parsed.toHexString())
      setOpacity(parsed.getAlpha())
    }
  }, [text, isOverridden])

  // Use a ref for onChange to avoid infinite loops if it's passed as an inline function
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Fire onChange whenever the derived output changes
  useEffect(() => {
    if (onChangeRef.current) {
      const hex8 = isOverridden ? `${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : null
      onChangeRef.current(text, hex8)
    }
  }, [text, hex, opacity, isOverridden])

  const hex8Output = isOverridden ? `${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : ''

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end px-1 min-h-[16px]">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest truncate mr-2">{label}</label>
        <button 
          type="button" 
          onClick={() => {
            if (!isOverridden) return;
            setIsOverridden(false)
            const parsed = tinycolor(parseDiscColor(text))
            setHex(parsed.toHexString())
            setOpacity(parsed.getAlpha())
          }}
          className={`text-[10px] text-indigo-500 font-bold hover:text-indigo-600 uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${isOverridden ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          Reset
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          name={name}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Blue, Pink..."
          className="w-full pl-5 pr-14 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none shadow-sm text-ellipsis overflow-hidden whitespace-nowrap"
        />
        
        {/* Color Picker Swatch */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
          <input
            type="color"
            value={hex}
            onChange={(e) => {
              setHex(e.target.value)
              setIsOverridden(true)
            }}
            className="absolute -inset-2 w-12 h-12 cursor-pointer bg-transparent border-0 outline-none"
          />
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mt-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Opacity</span>
          <span className="text-[9px] font-bold text-slate-500">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={opacity}
          onChange={(e) => {
            setOpacity(parseFloat(e.target.value))
            setIsOverridden(true)
          }}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Hidden input for the DB hex override */}
      <input type="hidden" name={`${name}Hex`} value={hex8Output} />
    </div>
  )
}
