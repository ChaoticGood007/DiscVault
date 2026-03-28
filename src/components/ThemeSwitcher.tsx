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

import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Sunset, Layers, Check } from 'lucide-react'

type Theme = 'light' | 'soft' | 'dark' | 'solarized'

const THEMES: { id: Theme; label: string; icon: React.ReactNode; preview: string; desc: string }[] = [
  {
    id: 'light',
    label: 'Light',
    icon: <Sun className="w-4 h-4" />,
    preview: '#ffffff',
    desc: 'Crisp white',
  },
  {
    id: 'soft',
    label: 'Soft',
    icon: <Sunset className="w-4 h-4" />,
    preview: '#fffbf0',
    desc: 'Warm cream',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: <Moon className="w-4 h-4" />,
    preview: '#1e293b',
    desc: 'Dark slate',
  },
  {
    id: 'solarized',
    label: 'Solar',
    icon: <Layers className="w-4 h-4" />,
    preview: '#073642',
    desc: 'Solarized',
  },
]

export default function ThemeSwitcher({ initialTheme = 'light' }: { initialTheme?: Theme }) {
  const [current, setCurrent] = useState<Theme>(initialTheme)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme)
    document.cookie = `dv_theme=${theme}; path=/; max-age=2592000; SameSite=Lax`
    setCurrent(theme)
    setOpen(false)
  }

  const active = THEMES.find(t => t.id === current)!

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        title={`Theme: ${active.label}`}
        aria-label="Switch theme"
      >
        {active.icon}
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{active.label}</span>
      </button>

      {/* Dropdown — always light so swatches show true colors */}
      <div
        data-theme="light"
        className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[200] transition-all origin-top-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-3 py-2 mb-1 border-b border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color Theme</span>
        </div>
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
              current === theme.id
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {/* Color swatch with selection badge */}
            <span className="relative w-6 h-6 shrink-0">
              <span
                className="absolute inset-0 rounded-lg border-2"
                style={{
                  backgroundColor: theme.preview,
                  borderColor: current === theme.id ? '#4f46e5' : '#e2e8f0',
                }}
              />
              {current === theme.id && (
                <span
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#4f46e5', border: '1.5px solid white' }}
                >
                  <Check className="w-2 h-2" style={{ color: '#ffffff' }} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="flex flex-col items-start">
              <span className="text-sm font-bold leading-none">{theme.label}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{theme.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
