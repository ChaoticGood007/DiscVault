'use client'

import { useState } from 'react'
import { X, Save, Check } from 'lucide-react'
import { bulkUpdateInventory } from '@/app/actions/inventory'
import { useRouter } from 'next/navigation'

interface BulkEditModalProps {
  selectedIds: string[]
  onClose: () => void
  onSuccess: () => void
}

export default function BulkEditModal({ selectedIds, onClose, onSuccess }: BulkEditModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track which fields the user actually wants to update
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({
    condition: false,
    weight: false,
    plastic: false,
    location: false,
  })

  // Track the actual values
  const [values, setValues] = useState<Record<string, any>>({
    condition: '',
    weight: '',
    plastic: '',
    location: '',
  })

  const toggleField = (field: string) => {
    setEnabledFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const updateValue = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const updates: Record<string, any> = {}
    

    if (enabledFields.condition) updates.condition = parseInt(values.condition) || null
    if (enabledFields.weight) updates.weight = parseFloat(values.weight) || null
    if (enabledFields.plastic) updates.plastic = values.plastic || null
    if (enabledFields.location) updates.location = values.location || null

    if (Object.keys(updates).length > 0) {
      await bulkUpdateInventory(selectedIds, updates)
      router.refresh()
    }
    
    setIsSubmitting(false)
    onSuccess()
  }

  const FieldRow = ({ field, label, children }: { field: string, label: string, children: React.ReactNode }) => (
    <div className={`p-4 rounded-2xl border transition-all ${enabledFields[field] ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => toggleField(field)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${enabledFields[field] ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}
        >
          {enabledFields[field] && <Check className="w-4 h-4" />}
        </button>
        <div className="flex-1 space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
          <div className={enabledFields[field] ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Multi-Edit</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
              Updating {selectedIds.length} Disc{selectedIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm font-medium mb-6">
            Check the box next to a field to overwrite that value on all selected discs. Unchecked fields will be left untouched.
          </div>


          <FieldRow field="condition" label="Condition (1-10)">
            <input
              type="number"
              min="1"
              max="10"
              value={values.condition}
              onChange={(e) => updateValue('condition', e.target.value)}
              placeholder="e.g. 8"
              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </FieldRow>

          <FieldRow field="weight" label="Weight (g)">
            <input
              type="number"
              step="0.1"
              value={values.weight}
              onChange={(e) => updateValue('weight', e.target.value)}
              placeholder="e.g. 175"
              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </FieldRow>
          
          <FieldRow field="plastic" label="Plastic">
            <input
              type="text"
              value={values.plastic}
              onChange={(e) => updateValue('plastic', e.target.value)}
              placeholder="e.g. Star"
              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </FieldRow>

          <FieldRow field="location" label="Location">
            <input
              type="text"
              value={values.location}
              onChange={(e) => updateValue('location', e.target.value)}
              placeholder="e.g. Top Shelf"
              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </FieldRow>
        </form>

        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.values(enabledFields).every(v => !v)}
            className="px-6 py-3 flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Apply to {selectedIds.length} Discs
          </button>
        </div>
      </div>
    </div>
  )
}
