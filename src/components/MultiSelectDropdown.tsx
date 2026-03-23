'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface MultiSelectDropdownProps {
  label: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  align?: 'left' | 'right'
}

export default function MultiSelectDropdown({ 
  label, 
  options, 
  selectedValues, 
  onChange, 
  placeholder,
  align = 'left' 
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayLabel = selectedValues.length === 0 
    ? placeholder || `All ${label}s` 
    : selectedValues.length === 1 
      ? selectedValues[0] 
      : `${selectedValues.length} Selected`

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val))
    } else {
      onChange([...selectedValues, val])
    }
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 flex items-center justify-between gap-2 shrink-0 ${
          selectedValues.length > 0
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute top-full ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[110] transition-all duration-200 ease-out ${
        isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      }`}>
        <button
          onClick={clearAll}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
            selectedValues.length === 0 ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {placeholder || `All ${label}s`}
          {selectedValues.length === 0 && <Check className="w-4 h-4" />}
        </button>
        <div className="max-h-56 overflow-y-auto mt-1 space-y-0.5">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => toggleValue(opt)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                selectedValues.includes(opt) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate pr-2">{opt}</span>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                selectedValues.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
              }`}>
                {selectedValues.includes(opt) && <Check className="w-3 h-3" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
