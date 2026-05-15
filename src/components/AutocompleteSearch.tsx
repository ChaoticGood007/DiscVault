'use client'

import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

const SYNTAX_KEYS = [
  { key: 'brand:', desc: 'Filter by brand (e.g. brand:innova)' },
  { key: 'mold:', desc: 'Filter by mold (e.g. mold:buzzz)' },
  { key: 'category:', desc: 'Filter by category (e.g. category:distance)' },
  { key: 'plastic:', desc: 'Filter by plastic (e.g. plastic:star)' },
  { key: 'color:', desc: 'Filter by color (e.g. color:blue)' },
  { key: 'stamp:', desc: 'Filter by stamp (e.g. stamp:stock)' },
  { key: 'foil:', desc: 'Filter by foil type' },
  { key: 'speed:', desc: 'Filter by speed (e.g. speed:>9, speed:9-11)' },
  { key: 'glide:', desc: 'Filter by glide' },
  { key: 'turn:', desc: 'Filter by turn' },
  { key: 'fade:', desc: 'Filter by fade' },
  { key: 'weight:', desc: 'Filter by weight (e.g. weight:170-175)' },
  { key: 'condition:', desc: 'Filter by condition (e.g. condition:10)' },
  { key: 'location:', desc: 'Filter by location (e.g. location:main)' },
  { key: 'bag:', desc: 'In bag? (e.g. bag:true)' },
]

interface AutocompleteSearchProps {
  value: string
  onChange: (val: string) => void
  categories: string[]
  brands: string[]
  plastics: string[]
  colors: string[]
  stamps: string[]
  stampFoils: string[]
  availableLocations: string[]
}

interface Suggestion {
  value: string
  label: string
  desc?: string
}

export default function AutocompleteSearch({
  value,
  onChange,
  categories,
  brands,
  plastics,
  colors,
  stamps,
  stampFoils,
  availableLocations
}: AutocompleteSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Map prefix to its corresponding array for value suggestions
  const arrayMap: Record<string, string[]> = {
    brand: brands,
    company: brands,
    category: categories,
    type: categories,
    plastic: plastics,
    color: colors,
    stamp: stamps,
    foil: stampFoils,
    stampfoil: stampFoils,
    location: availableLocations,
  }

  // Parses the query up to the cursor to find the current active token being typed
  const getCurrentTokenInfo = () => {
    if (!inputRef.current) return null
    const cursor = inputRef.current.selectionStart || value.length
    const textBeforeCursor = value.substring(0, cursor)
    
    // Find the start of the current token (split by spaces, but ignoring quotes - simplified here)
    const parts = textBeforeCursor.split(/\s+/)
    const currentToken = parts[parts.length - 1]
    const tokenStartIdx = textBeforeCursor.lastIndexOf(currentToken)
    
    return { currentToken, tokenStartIdx, tokenEndIdx: cursor }
  }

  useEffect(() => {
    if (!isOpen) return

    const info = getCurrentTokenInfo()
    if (!info) return

    const { currentToken } = info
    
    if (!currentToken) {
      // Empty state: show all keys
      setSuggestions(SYNTAX_KEYS.map(k => ({ value: k.key, label: k.key, desc: k.desc })))
      setSelectedIndex(0)
      return
    }

    if (currentToken.includes(':')) {
      // Suggesting values for a key
      const [prefix, partialValue] = currentToken.split(':')
      const lowerPrefix = prefix.toLowerCase()
      
      if (lowerPrefix === 'bag' || lowerPrefix === 'inbag') {
        const bools = ['true', 'false']
        const matches = bools.filter(b => b.startsWith(partialValue.toLowerCase()))
        setSuggestions(matches.map(m => ({ value: `${prefix}:${m}`, label: m })))
      } else if (arrayMap[lowerPrefix]) {
        const options = arrayMap[lowerPrefix]
        const lowerPartial = partialValue.toLowerCase()
        const matches = options.filter(opt => opt.toLowerCase().includes(lowerPartial))
        setSuggestions(matches.map(m => ({ value: `${prefix}:"${m}"`, label: m })))
      } else {
        setSuggestions([])
      }
    } else {
      // Typing a key prefix
      const lowerToken = currentToken.toLowerCase()
      const matches = SYNTAX_KEYS.filter(k => k.key.startsWith(lowerToken))
      
      // If no matches, assume they are just doing a plain text search
      if (matches.length === 0) {
        if (currentToken.length <= 2) {
          setSuggestions(SYNTAX_KEYS.map(k => ({ value: k.key, label: k.key, desc: k.desc })))
          setSelectedIndex(-1)
          return
        } else {
          setSuggestions([])
        }
      } else {
        // Show all matches in scrollable dropdown
        setSuggestions(matches.map(k => ({ value: k.key, label: k.key, desc: k.desc })))
      }
    }
    setSelectedIndex(0)
  }, [value, isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ensure the selected item is always scrolled into view
  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      const el = document.getElementById(`suggestion-${selectedIndex}`)
      if (el) {
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, isOpen, suggestions.length])

  const applySuggestion = (suggestion: Suggestion) => {
    const info = getCurrentTokenInfo()
    if (!info) return
    
    const { tokenStartIdx, tokenEndIdx } = info
    const before = value.substring(0, tokenStartIdx)
    const after = value.substring(tokenEndIdx)
    
    // If the suggestion doesn't end in a colon, it's a completed value (or full text token), so add a space
    const suffix = suggestion.value.endsWith(':') ? '' : ' '
    const newValue = before + suggestion.value + suffix + after
    
    onChange(newValue)
    
    if (suggestion.value.endsWith(':')) {
      // Keep dropdown open for the value
      inputRef.current?.focus()
    } else {
      setIsOpen(false)
    }
    
    // Set cursor position after the newly inserted token
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = tokenStartIdx + suggestion.value.length + suffix.length
        inputRef.current.setSelectionRange(newPos, newPos)
        inputRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' || e.key === 'Tab' || e.key === ' ') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault()
        applySuggestion(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative flex-grow w-full max-w-3xl" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        id="toolbar-search"
        placeholder='Search discs or use filters (e.g. brand:innova speed:>9 "Rot")...'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-black focus:ring-4 focus:ring-indigo-100 outline-none bg-slate-50 text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
      />
      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[150] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <button
                key={s.value}
                id={`suggestion-${idx}`}
                onClick={() => applySuggestion(s)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between group ${
                  idx === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${idx === selectedIndex ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {s.label}
                  </span>
                  {s.desc && (
                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {s.desc}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
