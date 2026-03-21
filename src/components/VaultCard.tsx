'use client'

import { useState, useRef, useEffect } from "react"
import { Inbox, Trash2, Edit2, Disc, ArrowRight, Check, X } from "lucide-react"
import { updateCollection, deleteCollection } from "@/app/actions/collections"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VaultCard({ 
  vault, 
  count 
}: { 
  vault: { id: string, name: string, description: string | null }, 
  count: number 
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(vault.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    if (name.trim() === '') return
    if (name.trim() === vault.name) {
      setIsEditing(false)
      return
    }
    
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('description', vault.description || '')
    
    await updateCollection(vault.id, formData)
    setIsEditing(false)
  }

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setName(vault.name)
    setIsEditing(false)
  }

  return (
    <div className="group relative h-full">
      <div 
        onClick={(e) => {
          // Only navigate if we're not actively editing the card inline
          if (!isEditing) {
            router.push(`/v/${vault.id}`)
          }
        }}
        className={`bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 h-full ${!isEditing ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 active:scale-[0.98]' : ''}`}
      >
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className={`p-5 rounded-3xl transition-all duration-500 ${!isEditing ? 'bg-slate-50 group-hover:bg-indigo-600' : 'bg-indigo-600'}`}>
            <Inbox className={`w-10 h-10 transition-colors ${!isEditing ? 'text-slate-400 group-hover:text-white' : 'text-white'}`} />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
            <Disc className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-black text-slate-900">{count}</span>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          {isEditing ? (
            <div 
              className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200" 
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave(e)
                  if (e.key === 'Escape') handleCancel(e)
                }}
                className="w-full px-3 py-1 border-b-2 border-indigo-500 font-black text-3xl text-slate-900 outline-none bg-transparent transition-all pb-1 min-w-0"
                placeholder="Vault Name..."
              />
              <button 
                onClick={handleSave} 
                className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors shrink-0"
              >
                <Check className="w-6 h-6" />
              </button>
              <button 
                onClick={handleCancel} 
                className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 animate-in fade-in duration-300">
              <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
                {vault.name}
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }} 
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all active:scale-95 shrink-0"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <p className="text-slate-500 font-medium mt-3 leading-relaxed line-clamp-2 italic">
            {vault.description || 'No description provided.'}
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">
            Enter Vault
          </span>
          <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
          </div>
        </div>

        {/* Decorative Background Glow */}
        {!isEditing && (
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        )}
      </div>

      {/* Quick Actions (Delete) */}
      {!isEditing && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              deleteCollection(vault.id)
            }}
            className="p-3 bg-white/80 backdrop-blur rounded-2xl text-slate-300 hover:text-red-500 transition-all hover:scale-110 shadow-sm border border-slate-100"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
