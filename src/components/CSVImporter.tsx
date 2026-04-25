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

import { useState } from 'react'
import Papa from 'papaparse'
import { importDiscs } from '@/app/actions/inventory'
import { Upload, ArrowRight, CheckCircle2, AlertCircle, Loader2, Inbox } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const SCHEMA_FIELDS = [
  { id: 'name', label: 'Disc Name / Mold', required: true },
  { id: 'brand', label: 'Manufacturer / Brand', required: true },
  { id: 'plastic', label: 'Plastic Type' },
  { id: 'weight', label: 'Weight (g)' },
  { id: 'speed', label: 'Speed' },
  { id: 'glide', label: 'Glide' },
  { id: 'turn', label: 'Turn' },
  { id: 'fade', label: 'Fade' },
  { id: 'category', label: 'Category' },
  { id: 'color', label: 'Color' },
  { id: 'secondaryColor', label: 'Secondary Color' },
  { id: 'secondaryPattern', label: 'Secondary Pattern' },
  { id: 'stamp', label: 'Stamp' },
  { id: 'stampFoil', label: 'Stamp Foil' },
  { id: 'location', label: 'Location' },
  { id: 'condition', label: 'Condition (1-10)' },
  { id: 'ink', label: 'Ink Status' },
  { id: 'notes', label: 'Notes' },
  { id: 'userGlide', label: 'Custom Glide' },
  { id: 'userTurn', label: 'Custom Turn' },
  { id: 'userFade', label: 'Custom Fade' },
]

interface Vault {
  id: string
  name: string
}

interface CSVImporterProps {
  targetVault?: Vault // Optional for "All" view
  collections?: Vault[] // Needed if no targetVault
}

export default function CSVImporter({ targetVault, collections }: CSVImporterProps) {
  const [step, setStep] = useState<'upload' | 'map' | 'importing' | 'complete'>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<{ success: number } | null>(null)
  
  const searchParams = useSearchParams()
  const [selectedVaultId, setSelectedVaultId] = useState<string>(targetVault?.id || searchParams.get('collection') || '')
  const router = useRouter()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedVaultId) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || [])
        setCsvData(results.data)
        
        // Initial auto-mapping attempt
        const initialMap: Record<string, string> = {}
        const normalizedHeaders = (results.meta.fields || []).map(h => h.toLowerCase().trim())
        
        SCHEMA_FIELDS.forEach(field => {
          const normalizedId = field.id.toLowerCase()
          const normalizedLabel = field.label.toLowerCase().split('/')[0].trim().replace(/\s+/g, '')
          const matchIndex = normalizedHeaders.findIndex(h => {
            const stripped = h.replace(/\s+/g, '')
            return stripped === normalizedId ||
              stripped.includes(normalizedLabel) ||
              h.includes(field.label.toLowerCase().split('/')[0].trim())
          })
          if (matchIndex !== -1) {
            initialMap[field.id] = (results.meta.fields || [])[matchIndex]
          }
        })
        
        setMapping(initialMap)
        setStep('map')
      }
    })
  }

  const handleImport = async () => {
    setStep('importing')
    
    const mappedRecords = csvData.map(row => {
      const record: any = {}
      Object.entries(mapping).forEach(([fieldId, csvHeader]) => {
        record[fieldId] = row[csvHeader]
      })
      return record
    })

    try {
      const result = await importDiscs(mappedRecords, selectedVaultId)
      setImportResult({ success: result.successCount })
      setStep('complete')
    } catch (e) {
      console.error(e)
      alert('Import failed. Check console for details.')
      setStep('map')
    }
  }

  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto mt-12 space-y-8">
        {!targetVault && collections && (
          <div className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-sm space-y-4 ${!selectedVaultId ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${!selectedVaultId ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">1. Select Target Vault (Required)</span>
            </div>
            <select
              value={selectedVaultId}
              onChange={(e) => setSelectedVaultId(e.target.value)}
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              required
            >
              <option value="">— Select Collection —</option>
              {collections.map(col => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
        )}

        <label className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed rounded-[40px] transition-all group shadow-sm ${!selectedVaultId ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed grayscale' : 'border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-8">
            <div className={`p-4 rounded-2xl mb-4 transition-transform ${selectedVaultId ? 'bg-indigo-50 group-hover:scale-110' : 'bg-slate-100'}`}>
              <Upload className={`w-10 h-10 ${selectedVaultId ? 'text-indigo-600' : 'text-slate-300'}`} />
            </div>
            <p className={`mb-2 text-xl font-black ${selectedVaultId ? 'text-slate-900' : 'text-slate-300'}`}>
              {targetVault ? 'Upload Inventory CSV' : '2. Upload Inventory CSV'}
            </p>
            <p className="text-sm font-medium text-slate-400">{selectedVaultId ? 'Drop your file here or click to browse' : 'Select a vault above to enable upload'}</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".csv" 
            onChange={handleFileUpload} 
            disabled={!selectedVaultId}
          />
        </label>
      </div>
    )
  }

  if (step === 'map') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Map Columns</h2>
              <p className="text-slate-500 font-medium tracking-tight uppercase text-xs font-black">
                Target Vault: <span className="text-indigo-600">{targetVault?.name || collections?.find(c => c.id === selectedVaultId)?.name}</span>
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={!mapping.name || !mapping.brand}
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Start Import <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCHEMA_FIELDS.map((field) => (
              <div key={field.id} className="flex flex-col space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                </div>
                <select
                  value={mapping[field.id] || ""}
                  onChange={(e) => setMapping({ ...mapping, [field.id]: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                >
                  <option value="">— Select Column —</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'importing') {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Importing Discs...</h2>
          <p className="text-slate-500 font-medium mt-2">Adding your collection. Please wait.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-20 space-y-8">
      <div className="inline-flex p-6 bg-emerald-50 rounded-[32px] mb-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-4xl font-black text-slate-900">Import Complete!</h2>
        <p className="text-xl text-slate-500 font-medium mt-4">
          Successfully added <span className="text-indigo-600 font-black">{importResult?.success}</span> discs to your vault.
        </p>
      </div>
      <div className="pt-8">
        <button
          onClick={() => router.push(selectedVaultId ? `/v/${selectedVaultId}` : '/')}
          className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          View Dashboard
        </button>
      </div>
    </div>
  )
}
