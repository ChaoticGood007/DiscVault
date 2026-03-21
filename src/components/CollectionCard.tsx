'use client'

import { useState, useRef, useEffect } from "react"
import { Inbox, Trash2, Edit2, X, Check } from "lucide-react"
import { updateCollection, deleteCollection } from "@/app/actions/collections"

export default function CollectionCard({ 
  vault, 
  count 
}: { 
  vault: { id: string, name: string, description: string | null }, 
  count: number 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(vault.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
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

  return (
    <div className="bg-white p-7 sm:p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-md hover:border-indigo-100/50">
      <div className="flex items-center gap-4 sm:gap-6 w-full pr-4">
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors shrink-0">
          <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2 max-w-sm animate-in fade-in zoom-in-95 duration-200">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') {
                    setName(vault.name)
                    setIsEditing(false)
                  }
                }}
                className="w-full px-3 py-1.5 border-2 border-indigo-500 rounded-xl font-black text-lg sm:text-xl text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all bg-white"
                placeholder="Vault Name..."
              />
              <button 
                onClick={handleSave} 
                className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors shrink-0 active:scale-95"
              >
                <Check className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setName(vault.name); setIsEditing(false) }} 
                className="p-2 sm:p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors shrink-0 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-slate-900 truncate">{vault.name}</h3>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-all active:scale-95 shrink-0 focus:opacity-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-500 font-medium">{count} Discs</p>
            </div>
          )}
        </div>
      </div>
      
      {!isEditing && (
        <div className="flex gap-2 shrink-0 animate-in fade-in zoom-in-95 duration-300">
          <button 
            onClick={() => deleteCollection(vault.id)}
            className="p-3 sm:p-4 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-90"
          >
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
    </div>
  )
}
