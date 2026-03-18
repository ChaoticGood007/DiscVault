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

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Edit3, Inbox, MoveRight, Trash2, Loader2 } from 'lucide-react'
import { moveDiscsToCollection, getPaginatedInventory } from '@/app/actions/inventory'
import { useRouter, useSearchParams } from 'next/navigation'
import { useInView } from 'react-intersection-observer'

interface InventoryItem {
  id: string
  collectionId: string | null
  weight: number | null
  color: string | null
  plastic: string | null
  stamp: string | null
  stampFoil: string | null
  location: string | null
  condition: number | null
  inBag: boolean
  ink: string | null
  notes: string | null
  createdAt: Date
  mold: {
    name: string
    brand: string
    category: string
    speed: number
    glide: number
    turn: number
    fade: number
  }
}

interface Collection {
  id: string
  name: string
}

interface InventoryListProps {
  initialItems: InventoryItem[]
  collections: Collection[]
  visibleColumns: string[]
  sortBy: string
  where: any
  orderBy: any
  pageSize: number
  totalCount: number
}

export default function InventoryList({ 
  initialItems, 
  collections, 
  visibleColumns, 
  sortBy,
  where,
  orderBy,
  pageSize,
  totalCount
}: InventoryListProps) {
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialItems.length < totalCount)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Reset when filters change
  useEffect(() => {
    setItems(initialItems)
    setPage(1)
    setHasMore(initialItems.length < totalCount)
    setSelectedIds([])
  }, [initialItems, totalCount])

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore()
    }
  }, [inView, hasMore, loading])

  const loadMore = async () => {
    setLoading(true)
    const nextPage = page + 1
    const newItems = await getPaginatedInventory({
      page: nextPage,
      pageSize,
      where,
      orderBy
    })

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems as any])
      setPage(nextPage)
      setHasMore(items.length + newItems.length < totalCount)
    } else {
      setHasMore(false)
    }
    setLoading(false)
  }

  const getSortUrl = (field: string) => {
    const currentOrder = searchParams.get('sortOrder') || 'desc'
    const currentSortBy = searchParams.get('sortBy') || 'createdAt'
    const newOrder = currentSortBy === field && currentOrder === 'asc' ? 'desc' : 'asc'
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', field)
    params.set('sortOrder', newOrder)
    params.set('page', '1')
    return `/?${params.toString()}`
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map(i => i.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkMove = async (targetId: string | null) => {
    if (selectedIds.length === 0) return
    await moveDiscsToCollection(selectedIds, targetId)
    setSelectedIds([])
    setShowMoveMenu(false)
  }

  const TableHeader = ({ field, label, center = false }: { field: string; label: string; center?: boolean }) => {
    if (!visibleColumns.includes(field)) return null;
    return (
      <th className={`px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest ${center ? 'text-center' : ''}`}>
        <Link href={getSortUrl(field)} className={`inline-flex items-center hover:text-indigo-600 transition-colors ${sortBy === field ? 'text-indigo-600' : ''}`}>
          {label}
          <ArrowUpDown className={`ml-1.5 h-3 w-3 opacity-50 ${sortBy === field ? 'opacity-100' : ''}`} />
        </Link>
      </th>
    )
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-[140] bg-indigo-600 px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-100 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 text-white">
            <span className="text-sm font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg">
              {selectedIds.length} Selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 font-black text-xs rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
              >
                <MoveRight className="w-4 h-4" />
                Move to Collection
              </button>
              
              {showMoveMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[150]">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Target Vault</span>
                  </div>
                  <button
                    onClick={() => handleBulkMove(null)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    No Collection
                  </button>
                  {collections.map(col => (
                    <button
                      key={col.id}
                      onClick={() => handleBulkMove(col.id)}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 bg-white/10 text-white font-black text-xs rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
                  />
                </th>
                <TableHeader field="inBag" label="Bag" />
                <TableHeader field="brand" label="Brand" />
                <TableHeader field="name" label="Mold" />
                <TableHeader field="category" label="Category" />
                <TableHeader field="speed" label="S" center />
                <TableHeader field="glide" label="G" center />
                <TableHeader field="turn" label="T" center />
                <TableHeader field="fade" label="F" center />
                <TableHeader field="plastic" label="Plastic" />
                <TableHeader field="weight" label="Weight" />
                <TableHeader field="condition" label="Cond" />
                <TableHeader field="ink" label="Ink" />
                <TableHeader field="location" label="Location" />
                <TableHeader field="createdAt" label="Added" />
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-indigo-50/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="px-6 py-5 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
                    />
                  </td>
                  {visibleColumns.includes('inBag') && (
                    <td className="px-6 py-5">
                      {item.inBag ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" title="In Bag" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" title="In Storage" />
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('brand') && <td className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-400">{item.mold.brand}</td>}
                  {visibleColumns.includes('name') && <td className="px-6 py-5 text-sm font-black text-indigo-600">{item.mold.name}</td>}
                  {visibleColumns.includes('category') && <td className="px-6 py-5 text-sm font-bold text-slate-500">{item.mold.category}</td>}
                  {visibleColumns.includes('speed') && <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.speed}</td>}
                  {visibleColumns.includes('glide') && <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.glide}</td>}
                  {visibleColumns.includes('turn') && <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.turn}</td>}
                  {visibleColumns.includes('fade') && <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.fade}</td>}
                  {visibleColumns.includes('plastic') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.plastic || "—"}</td>}
                  {visibleColumns.includes('weight') && <td className="px-6 py-5 text-sm font-black text-indigo-600">{item.weight ? `${item.weight}g` : "—"}</td>}
                  {visibleColumns.includes('condition') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.condition ? `${item.condition}/10` : "—"}</td>}
                  {visibleColumns.includes('ink') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.ink || "—"}</td>}
                  {visibleColumns.includes('location') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.location || "—"}</td>}
                  <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/v/${item.collectionId || 'all'}/inventory/${item.id}/edit`}
                      className="inline-flex p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading Trigger */}
      <div ref={ref} className="py-8 flex justify-center">
        {hasMore && (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</span>
          </div>
        )}
      </div>
    </div>
  )
}
