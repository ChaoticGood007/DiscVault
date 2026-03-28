'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Inbox, Settings } from 'lucide-react'

export default function VaultSwitcher({ 
  vaults, 
  activeId 
}: { 
  vaults: { id: string, name: string }[]
  activeId: string 
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const activeVault = vaults.find(v => v.id === activeId)

  // Gracefully close the interactive dropdown if the user clicks anywhere else on the screen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Primary Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-xl font-black text-slate-900 leading-tight outline-none hover:text-indigo-600 transition-colors group active:scale-[0.98]"
      >
        <span className="truncate max-w-[150px] sm:max-w-xs">{activeVault?.name || 'Select Vault'}</span>
        <ChevronDown 
          className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-indigo-600 transition-transform duration-300 ease-in-out ${isOpen ? '-rotate-180' : ''}`} 
        />
      </button>

      {/* Floating Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 py-2 z-50 overflow-hidden ring-1 ring-slate-900/5 transition-all duration-300 ease-out origin-top-left ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}
      >
        <div className="max-h-[60vh] overflow-y-auto no-scrollbar scroll-smooth">
          {vaults.map(v => (
            <button
              key={v.id}
              onClick={() => {
                setIsOpen(false)
                const cname = `vault_filter_${v.id}=`
                const decodedCookie = decodeURIComponent(document.cookie)
                let cval = ''
                const ca = decodedCookie.split(';')
                for(let i = 0; i <ca.length; i++) {
                  let c = ca[i]
                  while (c.charAt(0) == ' ') c = c.substring(1)
                  if (c.indexOf(cname) == 0) cval = c.substring(cname.length, c.length)
                }
                router.push(cval ? `/v/${v.id}?${cval}` : `/v/${v.id}`)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                activeId === v.id 
                  ? 'bg-indigo-50/80 text-indigo-900' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors duration-200 ${
                activeId === v.id 
                  ? 'bg-indigo-100 text-indigo-600 shrink-0' 
                  : 'bg-slate-100 text-slate-400 shrink-0'
              }`}>
                <Inbox className="w-4 h-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm">{v.name}</span>
                {activeId === v.id && <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 mt-0.5">Active</span>}
              </div>
            </button>
          ))}
        </div>

        <div className="h-px bg-slate-100 my-2 mx-4" />

        {/* Settings Action Hub */}
        <button
          onClick={() => {
            setIsOpen(false)
            router.push('/vaults')
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 group"
        >
          <div className="p-2 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-colors shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">Manage Vaults</span>
        </button>
      </div>
    </div>
  )
}
