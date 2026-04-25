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

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Prisma } from '@prisma/client'
import { getPaginatedInventory } from '@/app/actions/inventory'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import DiscPreview from './DiscPreview'

export interface InventoryItem {
  id: string
  collectionId: string | null
  weight: number | null
  color: string | null
  secondaryColor?: string | null
  secondaryPattern?: string | null
  plastic: string | null
  stamp: string | null
  stampFoil: string | null
  location: string | null
  condition: number | null
  ink: string | null
  notes: string | null
  userGlide: number | null
  userTurn: number | null
  userFade: number | null
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

interface InventoryInfiniteListProps {
  initialItems: InventoryItem[]
  where: Prisma.InventoryWhereInput
  orderBy: Prisma.InventoryOrderByWithRelationInput
  pageSize: number
  totalCount: number
  bagPaths?: string[]
  visibleColumns?: string[]
  categoryColors?: Record<string, string>
  useUserFlightNumbers?: boolean
}

export default function InventoryInfiniteList({ 
  initialItems, 
  where, 
  orderBy, 
  pageSize, 
  totalCount, 
  visibleColumns = ['brand', 'category', 'flight_numbers', 'plastic', 'weight', 'color', 'stamp', 'inBag', 'createdAt'], 
  categoryColors,
  bagPaths = [],
  useUserFlightNumbers = false
}: InventoryInfiniteListProps) {
  const isInBag = (loc: string | null) => {
    if (!loc) return false
    return bagPaths.some(p => loc === p || loc.startsWith(p + '/'))
  }
  const [items, setItems] = useState(initialItems)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialItems.length < totalCount)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView()

  // Reset when filters change (initialItems changes)
  useEffect(() => {
    setItems(initialItems)
    setPage(1)
    setHasMore(initialItems.length < totalCount)
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
      setItems(prev => [...prev, ...newItems])
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

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {items.map((item) => (
          <Link href={`/v/${item.collectionId || 'all'}/inventory/${item.id}`} key={item.id} className="bg-white rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all border border-slate-100 overflow-hidden group relative flex flex-col cursor-pointer">
            {/* Organizational Color Accent */}
            {categoryColors && item.mold?.category && categoryColors[item.mold.category] && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-2.5 z-10"
                style={{ backgroundColor: categoryColors[item.mold.category] }} 
              />
            )}

            <div className={`p-4 md:p-6 flex-1 ${categoryColors && item.mold?.category && categoryColors[item.mold.category] ? 'pl-6 md:pl-8' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {visibleColumns.includes('brand') && (
                    <span className="inline-flex items-center px-4 h-[28px] rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50/50 border border-indigo-100 whitespace-nowrap">
                      {item.mold.brand}
                    </span>
                  )}
                  {visibleColumns.includes('inBag') && isInBag(item.location) && (
                    <span className="inline-flex items-center px-4 h-[28px] rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 whitespace-nowrap">
                      In Bag
                    </span>
                  )}
                </div>
                {visibleColumns.includes('weight') && item.weight && (
                  <span className="inline-flex items-center px-3 h-[24px] text-[10px] font-black tracking-widest text-slate-500 uppercase rounded-full border border-slate-200 bg-slate-50/80 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 shrink-0">
                    {item.weight}g
                  </span>
                )}
              </div>

              <div className="mb-3 md:mb-5 mt-1">
                {visibleColumns.includes('name') && (
                  <div className="inline-block">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 transition-colors leading-tight break-words group-hover:text-indigo-600">
                      {item.mold.name}
                    </h3>
                  </div>
                )}
                {(visibleColumns.includes('plastic') || visibleColumns.includes('category') || visibleColumns.includes('stamp') || visibleColumns.includes('color')) && (
                  <div className="flex flex-wrap items-center gap-y-2 mt-2">
                    {(() => {
                      const tags = []

                      if (visibleColumns.includes('plastic') && item.plastic) {
                        tags.push(
                          <span key="plastic" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                            {item.plastic}
                          </span>
                        )
                      }
                      
                      if (visibleColumns.includes('category')) {
                        tags.push(
                          <span key="category" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {item.mold.category}
                          </span>
                        )
                      }

                      if (visibleColumns.includes('color') && item.color) {
                        tags.push(
                          <div key="color" className="flex items-center gap-1.5" title={item.color}>
                            <DiscPreview
                              color={item.color}
                              secondaryColor={item.secondaryColor}
                              secondaryPattern={item.secondaryPattern}
                              stampFoil={item.stampFoil}
                              size={12}
                              hoverScale={5}
                              disc={item}
                            />

                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">
                              {item.color}
                            </span>
                          </div>
                        )
                      }
                      if (visibleColumns.includes('stamp') && item.stampFoil) {
                        tags.push(
                          <span key="foil" className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                            {item.stampFoil} Foil
                          </span>
                        )
                      }

                      if (visibleColumns.includes('stamp')) {
                        tags.push(
                          <span key="stamp" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {item.stamp || 'Stock'} Stamp
                          </span>
                        )
                      }

                      return tags.map((tag, index) => (
                        <div key={tag.key} className="flex items-center">
                          {tag}
                          {index < tags.length - 1 && (
                            <div className="w-[2px] h-3 bg-slate-200 rounded-full mx-2" />
                          )}
                        </div>
                      ))
                    })()}
                  </div>
                )}
              </div>

              {visibleColumns.includes('flight_numbers') && (
                <div className="flex flex-wrap items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100 mb-4 md:mb-6 gap-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Flight Numbers</div>
                  <div className="flex space-x-2">
                    {[
                      { key: 'speed', label: 'S', val: item.mold.speed, isCustom: false },
                      { key: 'glide', label: 'G', val: useUserFlightNumbers && item.userGlide !== null ? item.userGlide : item.mold.glide, isCustom: useUserFlightNumbers && item.userGlide !== null },
                      { key: 'turn', label: 'T', val: useUserFlightNumbers && item.userTurn !== null ? item.userTurn : item.mold.turn, isCustom: useUserFlightNumbers && item.userTurn !== null },
                      { key: 'fade', label: 'F', val: useUserFlightNumbers && item.userFade !== null ? item.userFade : item.mold.fade, isCustom: useUserFlightNumbers && item.userFade !== null }
                    ].map((stat, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white ${stat.isCustom ? 'text-amber-600 border-amber-200 shadow-amber-100' : 'text-slate-900 border-slate-200'} font-black text-xs md:text-sm border shadow-sm transition-transform group-hover:scale-110`}>
                          {stat.val}{stat.isCustom && '*'}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">{stat.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(visibleColumns.includes('condition') || visibleColumns.includes('location') || visibleColumns.includes('ink')) && (
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 py-3 md:py-4 border-t border-slate-50">
                  {visibleColumns.includes('condition') && (
                    <div className="space-y-1 flex flex-col items-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cond</span>
                      <span className="block font-black text-emerald-600 text-sm text-center">{item.condition ? `${item.condition}/10` : "—"}</span>
                    </div>
                  )}
                  {visibleColumns.includes('ink') && (
                    <div className="space-y-1 flex flex-col items-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ink</span>
                      <span className="block font-black text-slate-700 text-sm text-center">{item.ink || "—"}</span>
                    </div>
                  )}
                  {visibleColumns.includes('location') && (
                    <div className="space-y-1 flex flex-col items-center">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
                      <span className="block font-black text-slate-700 text-sm text-center">{item.location || "—"}</span>
                    </div>
                  )}
                </div>
              )}

              {visibleColumns.includes('notes') && item.notes && (
                <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">&quot;{item.notes}&quot;</p>
                </div>
              )}
            </div>
            
            {visibleColumns.includes('createdAt') && (
              <span className="absolute bottom-3 right-4 md:right-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Loading Trigger */}
      <div ref={ref} className="py-12 flex justify-center">
        {hasMore && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Vault...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <div className="text-center">
            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-4"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Collection</p>
          </div>
        )}
      </div>
    </div>
  )
}
