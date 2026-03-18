/*
 * Copyright 2026 Google LLC
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
import { Download, Loader2 } from 'lucide-react'
import { exportInventory } from '@/app/actions/inventory'
import Papa from 'papaparse'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const data = await exportInventory()
      
      const flatData = data.map(item => ({
        Manufacturer: item.mold.brand,
        Mold: item.mold.name,
        Category: item.mold.category,
        Speed: item.mold.speed,
        Glide: item.mold.glide,
        Turn: item.mold.turn,
        Fade: item.mold.fade,
        Plastic: item.plastic || '',
        Weight: item.weight || '',
        Color: item.color || '',
        Stamp: item.stamp || '',
        StampFoil: item.stampFoil || '',
        Location: item.location || '',
        Condition: item.condition || '',
        Ink: item.ink || '',
        Notes: item.notes || '',
        AddedDate: new Date(item.createdAt).toLocaleDateString()
      }))

      const csv = Papa.unparse(flatData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.setAttribute('href', url)
      link.setAttribute('download', `discvault_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error('Export failed', e)
      alert('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center px-6 py-3 border border-slate-200 text-sm font-black rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export CSV
    </button>
  )
}
