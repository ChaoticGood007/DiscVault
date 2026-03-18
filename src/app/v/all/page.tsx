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

import { db as prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { Disc, Plus, Upload } from "lucide-react"
import DashboardToolbar from "@/components/DashboardToolbar"
import ExportButton from "@/components/ExportButton"
import InventoryList from "@/components/InventoryList"
import InventoryInfiniteList from "@/components/InventoryInfiniteList"

type SortField = 'name' | 'brand' | 'category' | 'speed' | 'glide' | 'turn' | 'fade' | 'createdAt' | 'plastic' | 'weight' | 'color' | 'stamp' | 'stampFoil' | 'location' | 'condition' | 'inBag' | 'ink';
type SortOrder = 'asc' | 'desc';

const DEFAULT_COLUMNS = ['inBag', 'brand', 'name', 'speed', 'glide', 'turn', 'fade', 'plastic', 'weight'];

export default async function AllVaultsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchP = await searchParams
  
  const category = typeof searchP.category === 'string' ? searchP.category : undefined
  const brand = typeof searchP.brand === 'string' ? searchP.brand : undefined
  const view = typeof searchP.view === 'string' ? searchP.view : 'cards'
  const sortBy = (typeof searchP.sortBy === 'string' ? searchP.sortBy : 'createdAt') as SortField
  const sortOrder = (typeof searchP.sortOrder === 'string' ? searchP.sortOrder : 'desc') as SortOrder
  const colsParam = typeof searchP.cols === 'string' ? searchP.cols.split(',') : DEFAULT_COLUMNS
  const searchQuery = typeof searchP.search === 'string' ? searchP.search : undefined
  const isInBag = searchP.inBag === 'true'
  const selectedCollectionIds = typeof searchP.collections === 'string' ? searchP.collections.split(',') : []

  const minSpeed = searchP.minSpeed ? parseFloat(searchP.minSpeed as string) : undefined
  const maxSpeed = searchP.maxSpeed ? parseFloat(searchP.maxSpeed as string) : undefined
  const minGlide = searchP.minGlide ? parseFloat(searchP.minGlide as string) : undefined
  const maxGlide = searchP.maxGlide ? parseFloat(searchP.maxGlide as string) : undefined
  const minTurn = searchP.minTurn ? parseFloat(searchP.minTurn as string) : undefined
  const maxTurn = searchP.maxTurn ? parseFloat(searchP.maxTurn as string) : undefined
  const minFade = searchP.minFade ? parseFloat(searchP.minFade as string) : undefined
  const maxFade = searchP.maxFade ? parseFloat(searchP.maxFade as string) : undefined
  const minWeight = searchP.minWeight ? parseFloat(searchP.minWeight as string) : undefined
  const maxWeight = searchP.maxWeight ? parseFloat(searchP.maxWeight as string) : undefined
  const minCond = searchP.minCond ? parseInt(searchP.minCond as string) : undefined
  const maxCond = searchP.maxCond ? parseInt(searchP.maxCond as string) : undefined
  const inkFilter = searchP.ink as string | undefined

  const pageSize = 24
  const page = typeof searchP.page === 'string' ? Math.max(1, parseInt(searchP.page)) : 1

  const getOrderBy = (field: SortField, order: SortOrder): Prisma.InventoryOrderByWithRelationInput => {
    if (['createdAt', 'plastic', 'weight', 'color', 'stamp', 'stampFoil', 'location', 'condition', 'inBag', 'ink'].includes(field)) {
      return { [field]: order }
    }
    return { mold: { [field]: order } }
  }

  const searchFilter: Prisma.InventoryWhereInput = searchQuery ? {
    OR: [
      { mold: { name: { contains: searchQuery } } },
      { mold: { brand: { contains: searchQuery } } },
      { mold: { category: { contains: searchQuery } } },
      { plastic: { contains: searchQuery } },
      { color: { contains: searchQuery } },
      { stamp: { contains: searchQuery } },
      { stampFoil: { contains: searchQuery } },
      { location: { contains: searchQuery } },
      { notes: { contains: searchQuery } },
    ]
  } : {}

  const whereClause: Prisma.InventoryWhereInput = {
    ...searchFilter,
    collectionId: selectedCollectionIds.length > 0 ? { in: selectedCollectionIds } : undefined,
    inBag: isInBag || undefined,
    weight: (minWeight !== undefined || maxWeight !== undefined) ? { gte: minWeight, lte: maxWeight } : undefined,
    condition: (minCond !== undefined || maxCond !== undefined) ? { gte: minCond, lte: maxCond } : undefined,
    ink: inkFilter === 'none' ? { equals: 'None' } : inkFilter === 'exists' ? { not: 'None' } : undefined,
    mold: {
      ...searchFilter.mold,
      category: category ? { contains: category } : searchFilter.mold?.category,
      brand: brand ? { contains: brand } : searchFilter.mold?.brand,
      speed: (minSpeed !== undefined || maxSpeed !== undefined) ? { gte: minSpeed, lte: maxSpeed } : undefined,
      glide: (minGlide !== undefined || maxGlide !== undefined) ? { gte: minGlide, lte: maxGlide } : undefined,
      turn: (minTurn !== undefined || maxTurn !== undefined) ? { gte: minTurn, lte: maxTurn } : undefined,
      fade: (minFade !== undefined || maxFade !== undefined) ? { gte: minFade, lte: maxFade } : undefined,
    },
  }

  const [inventoryBrands, inventoryCategories, collections, inventory, totalCount] = await Promise.all([
    prisma.inventory.findMany({
      where: selectedCollectionIds.length > 0 ? { collectionId: { in: selectedCollectionIds } } : {},
      select: { mold: { select: { brand: true } } },
      distinct: ['moldId'],
    }),
    prisma.inventory.findMany({
      where: selectedCollectionIds.length > 0 ? { collectionId: { in: selectedCollectionIds } } : {},
      select: { mold: { select: { category: true } } },
      distinct: ['moldId'],
    }),
    prisma.discCollection.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventory.findMany({
      where: whereClause,
      include: { mold: true, collection: true },
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inventory.count({ where: whereClause })
  ])

  const brandsList = Array.from(new Set(inventoryBrands.map(i => i.mold.brand))).sort()
  const categoriesList = Array.from(new Set(inventoryCategories.map(i => i.mold.category))).sort()

  const activeFiltersCount = (category ? 1 : 0) + (brand ? 1 : 0) + (searchQuery ? 1 : 0) + (isInBag ? 1 : 0) + selectedCollectionIds.length + Object.values(searchP).filter(v => v !== undefined && v !== '').length - (searchP.view ? 1 : 0) - (searchP.sortBy ? 1 : 0) - (searchP.sortOrder ? 1 : 0) - (searchP.cols ? 1 : 0) - (searchP.page ? 1 : 0) - (searchP.collections ? 1 : 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Inventory</h2>
          <p className="text-sm text-slate-500 font-medium">Viewing {totalCount} discs across all active filters.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton />
          <Link
            href="/v/all/import"
            className="inline-flex items-center px-6 py-3 border border-slate-200 text-sm font-black rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
          <Link
            href="/v/all/add"
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-black rounded-2xl shadow-xl shadow-indigo-100 text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <Plus className="mr-2 h-6 w-6" />
            Add Disc
          </Link>
        </div>
      </div>

      <DashboardToolbar 
        brands={brandsList}
        categories={categoriesList}
        collections={collections as any}
        currentCollectionIds={selectedCollectionIds}
        currentCategory={category}
        currentBrand={brand}
        currentView={view}
        searchQuery={searchQuery}
        isInBag={isInBag}
        advancedFilters={{
          minSpeed, maxSpeed,
          minGlide, maxGlide,
          minTurn, maxTurn,
          minFade, maxFade,
          minWeight, maxWeight,
          minCond, maxCond,
          ink: inkFilter
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        visibleColumns={colsParam}
      />

      {totalCount === 0 ? (
        <div className="text-center py-24 bg-white rounded-[32px] border-4 border-dashed border-slate-100 shadow-inner">
          <Disc className="mx-auto h-24 w-24 text-slate-200 mb-6 animate-spin-slow" />
          {activeFiltersCount > 0 ? (
            <>
              <h3 className="text-3xl font-black text-slate-900">No matching discs</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">Try adjusting your filters or search terms.</p>
              <div className="mt-10">
                <Link
                  href="/v/all"
                  className="inline-flex items-center px-10 py-4 text-lg font-black rounded-2xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm"
                >
                  Clear Filters
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-3xl font-black text-slate-900">Your total inventory is empty</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">Start building your collection by adding discs to individual vaults.</p>
            </>
          )}
        </div>
      ) : view === 'cards' ? (
        <InventoryInfiniteList 
          initialItems={inventory as any}
          where={whereClause}
          orderBy={getOrderBy(sortBy, sortOrder)}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      ) : (
        <InventoryList 
          initialItems={inventory as any} 
          collections={collections as any}
          visibleColumns={colsParam}
          sortBy={sortBy}
          where={whereClause}
          orderBy={getOrderBy(sortBy, sortOrder)}
          pageSize={pageSize}
          totalCount={totalCount}
        />
      )}
    </div>
  )
}
