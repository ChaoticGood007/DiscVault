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

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpDown, Edit3, Inbox, MoveRight, Trash2, Loader2 } from 'lucide-react'
import { moveDiscsToCollection, getPaginatedInventory } from '@/app/actions/inventory'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import BulkEditModal from './BulkEditModal'

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

import { Prisma } from '@prisma/client'

interface Collection {
  id: string
  name: string
}

interface InventoryListProps {
  initialItems: InventoryItem[]
  collections: Collection[]
  visibleColumns: string[]
  bagPaths?: string[]
  sortBy: string
  where: Prisma.InventoryWhereInput
  orderBy: Prisma.InventoryOrderByWithRelationInput
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
  totalCount,
  bagPaths = []
}: InventoryListProps) {
  const isInBag = (loc: string | null) => {
    if (!loc) return false
    return bagPaths.some(p => loc === p || loc.startsWith(p + '/'))
  }
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialItems.length < totalCount)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Reset when filters change
  useEffect(() => {
    setItems(initialItems)
    setPage(1)
    setHasMore(initialItems.length < totalCount)
    setSelectedIds([])
  }, [initialItems, totalCount])

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

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore()
    }
  }, [inView, hasMore, loading])

  const getSortUrl = (field: string) => {
    const currentOrder = searchParams.get('sortOrder') || 'desc'
    const currentSortBy = searchParams.get('sortBy') || 'createdAt'
    const newOrder = currentSortBy === field && currentOrder === 'asc' ? 'desc' : 'asc'
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', field)
    params.set('sortOrder', newOrder)
    params.set('page', '1')
    return `${pathname}?${params.toString()}`
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

  const TableHeader = ({ field, label, checkField, center = false }: { field: string; label: string; checkField?: string; center?: boolean }) => {
    const isVisible = visibleColumns.includes(checkField || field);
    if (!isVisible) return null;
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
    <div className="flex flex-col h-full space-y-4">
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-[140] bg-indigo-600 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl shadow-indigo-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 sm:gap-4 text-white">
            <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest bg-white/20 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap">
              {selectedIds.length} Selected
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button 
              onClick={() => setShowBulkEdit(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[10px] sm:text-xs rounded-xl transition-all active:scale-95 shadow-sm whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Edit Selected</span>
              <span className="xs:hidden">Edit</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-indigo-600 font-black text-[10px] sm:text-xs rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-sm whitespace-nowrap"
              >
                <MoveRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Move
              </button>
              
              {showMoveMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[150] animate-in fade-in zoom-in-95 duration-200">
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
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 text-white font-black text-[10px] sm:text-xs rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showBulkEdit && (
        <BulkEditModal
          selectedIds={selectedIds}
          onClose={() => setShowBulkEdit(false)}
          onSuccess={() => {
            setShowBulkEdit(false)
            setSelectedIds([])
          }}
        />
      )}

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-slate-50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <tr className="border-b border-slate-100">
                <th className="sticky left-0 z-30 bg-slate-50 px-6 py-4 text-center border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
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
                <TableHeader field="speed" label="S" checkField="flight_numbers" center />
                <TableHeader field="glide" label="G" checkField="flight_numbers" center />
                <TableHeader field="turn" label="T" checkField="flight_numbers" center />
                <TableHeader field="fade" label="F" checkField="flight_numbers" center />
                <TableHeader field="plastic" label="Plastic" />
                <TableHeader field="weight" label="Weight" />
                <TableHeader field="color" label="Color" />
                <TableHeader field="stamp" label="Stamp" />
                <TableHeader field="condition" label="Cond" />
                <TableHeader field="ink" label="Ink" />
                <TableHeader field="location" label="Location" />
                <TableHeader field="notes" label="Notes" />
                <TableHeader field="createdAt" label="Added" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-indigo-50/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-indigo-50/50' : ''}`}
                >
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-indigo-50/30 px-6 py-5 text-center border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
                    />
                  </td>
                  {visibleColumns.includes('inBag') && (
                    <td className="px-6 py-5">
                      {isInBag(item.location) ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" title="In Bag" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" title="In Storage" />
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('brand') && <td className="px-6 py-5 text-sm font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-400">{item.mold.brand}</td>}
                  {visibleColumns.includes('name') && (
                    <td className="px-6 py-5 text-sm font-black text-indigo-600">
                      <Link href={`/v/${item.collectionId || 'all'}/inventory/${item.id}`} className="hover:text-indigo-800 hover:underline">
                        {item.mold.name}
                      </Link>
                    </td>
                  )}
                  {visibleColumns.includes('category') && <td className="px-6 py-5 text-sm font-bold text-slate-500">{item.mold.category}</td>}
                  {visibleColumns.includes('flight_numbers') && (
                    <>
                      <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.speed}</td>
                      <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.glide}</td>
                      <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.turn}</td>
                      <td className="px-6 py-5 text-sm font-black text-center text-slate-900">{item.mold.fade}</td>
                    </>
                  )}
                  {visibleColumns.includes('plastic') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.plastic || "—"}</td>}
                  {visibleColumns.includes('weight') && <td className="px-6 py-5 text-sm font-black text-indigo-600">{item.weight ? `${item.weight}g` : "—"}</td>}
                  {visibleColumns.includes('color') && (
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {item.color && (
                          <div 
                            className="w-3 h-3 rounded-full border border-slate-200 shrink-0" 
                            style={{ backgroundColor: item.color.toLowerCase().includes('/') ? item.color.split('/')[0] : item.color }}
                          />
                        )}
                        <span className="text-sm font-bold text-slate-700">{item.color || "—"}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('stamp') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.stampFoil ? `${item.stamp} (${item.stampFoil})` : item.stamp || "—"}</td>}
                  {visibleColumns.includes('condition') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.condition ? `${item.condition}/10` : "—"}</td>}
                  {visibleColumns.includes('ink') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.ink || "—"}</td>}
                  {visibleColumns.includes('location') && <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.location || "—"}</td>}
                  {visibleColumns.includes('notes') && <td className="px-6 py-5 text-xs font-medium text-slate-500 max-w-[200px] truncate">{item.notes || "—"}</td>}
                  {visibleColumns.includes('createdAt') && (
                    <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Loading Trigger */}
          <div ref={ref} className="py-8 flex justify-center w-full relative z-0">
            {hasMore ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</span>
              </div>
            ) : (
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-4">
                End of Inventory
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
