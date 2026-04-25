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
import { Download, Loader2 } from 'lucide-react'
import { exportInventory } from '@/app/actions/inventory'
import Papa from 'papaparse'

export default function ExportButton({ variant = 'default' }: { variant?: 'default' | 'header' }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const data = await exportInventory()
      
      const flatData = data.map(item => ({
        Vault: item.collection?.name || '',
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
        SecondaryColor: item.secondaryColor || '',
        SecondaryPattern: item.secondaryPattern || '',
        Stamp: item.stamp || '',
        StampFoil: item.stampFoil || '',
        Location: item.location || '',
        Condition: item.condition || '',
        Ink: item.ink || '',
        Notes: item.notes || '',
        UserGlide: item.userGlide ?? '',
        UserTurn: item.userTurn ?? '',
        UserFade: item.userFade ?? '',
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

  const buttonClass = variant === 'header'
    ? "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all text-slate-500 hover:text-indigo-600 group shrink-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
    : "inline-flex items-center px-6 py-3 border border-slate-200 text-sm font-black rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm disabled:opacity-50"
  
  const iconClass = variant === 'header'
    ? "w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-indigo-600 transition-colors"
    : "mr-2 h-4 w-4"

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={buttonClass}
    >
      {loading ? (
        <Loader2 className={`${iconClass} animate-spin ${variant === 'header' ? '' : 'text-indigo-600'}`} />
      ) : (
        <Download className={iconClass} />
      )}
      {variant === 'header' ? 'Export' : 'Export CSV'}
    </button>
  )
}
