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

import { db as prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { cookies } from "next/headers"
import Link from "next/link"
import { Disc, Plus, Edit3 } from "lucide-react"
import DashboardToolbar from "@/components/DashboardToolbar"
import ExportButton from "@/components/ExportButton"
import InventoryList from "@/components/InventoryList"
import InventoryInfiniteList from "@/components/InventoryInfiniteList"
import FloatingSearchButton from "@/components/FloatingSearchButton"
import FilterPreserver from "@/components/FilterPreserver"
import { getCategoryColors, getLocationTree } from "@/app/actions/settings"
import { flattenTree } from "@/lib/locationTree"
import { parseSearchQuery } from "@/lib/searchParser"


type SortField = 'name' | 'brand' | 'category' | 'speed' | 'glide' | 'turn' | 'fade' | 'createdAt' | 'plastic' | 'weight' | 'color' | 'stamp' | 'stampFoil' | 'location' | 'condition' | 'ink';
type SortOrder = 'asc' | 'desc';

const DEFAULT_COLUMNS = ['brand', 'name', 'speed', 'glide', 'turn', 'fade', 'plastic', 'weight'];

export default async function VaultDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ vaultId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { vaultId } = await params
  const searchP = await searchParams
  
  const view = typeof searchP.view === 'string' ? searchP.view : 'cards'
  const cookieStore = await cookies()
  const defaultSortBy = cookieStore.get('discVaultSortBy')?.value || 'createdAt'
  const defaultSortOrder = cookieStore.get('discVaultSortOrder')?.value || 'desc'
  const sortBy = (typeof searchP.sortBy === 'string' ? searchP.sortBy : defaultSortBy) as SortField
  const sortOrder = (typeof searchP.sortOrder === 'string' ? searchP.sortOrder : defaultSortOrder) as SortOrder

  const savedColsCookie = cookieStore.get('discVaultVisibleCols')
  const cookieCols = savedColsCookie ? savedColsCookie.value.split(',') : DEFAULT_COLUMNS
  const colsParam = typeof searchP.cols === 'string' ? searchP.cols.split(',') : cookieCols
  const visibleCols = colsParam.includes('name') ? colsParam : ['name', ...colsParam]
  const searchQuery = typeof searchP.search === 'string' ? searchP.search : undefined

  const userFlightCookie = cookieStore.get('discVaultUserFlightNum')?.value === 'true'
  const useUserFlightNumbers = typeof searchP.useUserFlightNumbers === 'string' 
    ? searchP.useUserFlightNumbers === 'true' 
    : userFlightCookie

  const pageSize = 24
  const page = typeof searchP.page === 'string' ? Math.max(1, parseInt(searchP.page)) : 1

  const locationTree = await getLocationTree(vaultId)
  const flatLocs = flattenTree(locationTree)
  const bagPaths = flatLocs.filter(l => l.node.inBag).map(l => l.value)
  const bagOptions = flatLocs.filter(l => l.node.inBag).map(l => ({ label: l.path, value: l.value }))

  const getOrderBy = (field: SortField, order: SortOrder): any => {
    if (['createdAt', 'plastic', 'weight', 'color', 'stamp', 'stampFoil', 'location', 'condition', 'ink'].includes(field)) {
      return { [field]: order }
    }
    return { mold: { [field]: order } }
  }

  const whereClause = parseSearchQuery(searchQuery || '', vaultId, bagPaths);

  const [
    inventoryBrands, inventoryCategories, 
    inventoryPlastics, inventoryColors, inventoryStamps, inventoryStampFoils,
    collections, inventory, totalCount, categoryColors
  ] = await Promise.all([
    prisma.inventory.findMany({ where: { collectionId: vaultId }, select: { mold: { select: { brand: true } } }, distinct: ['moldId'] }),
    prisma.inventory.findMany({ where: { collectionId: vaultId }, select: { mold: { select: { category: true } } }, distinct: ['moldId'] }),
    prisma.inventory.findMany({ where: { collectionId: vaultId, plastic: { not: null } }, select: { plastic: true }, distinct: ['plastic'] }),
    prisma.inventory.findMany({ where: { collectionId: vaultId, color: { not: null } }, select: { color: true }, distinct: ['color'] }),
    prisma.inventory.findMany({ where: { collectionId: vaultId, stamp: { not: null } }, select: { stamp: true }, distinct: ['stamp'] }),
    prisma.inventory.findMany({ where: { collectionId: vaultId, stampFoil: { not: null } }, select: { stampFoil: true }, distinct: ['stampFoil'] }),
    prisma.discCollection.findMany({ orderBy: { name: 'asc' } }),
    prisma.inventory.findMany({
      where: whereClause,
      include: { mold: true, collection: true },
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inventory.count({ where: whereClause }),
    getCategoryColors(),
  ])

  const brandsList = Array.from(new Set(inventoryBrands.map((i: any) => i.mold.brand))).filter(Boolean).sort() as string[]
  const categoriesList = Array.from(new Set(inventoryCategories.map((i: any) => i.mold.category))).filter(Boolean).sort() as string[]
  const plasticsList = ['Not Defined', ...Array.from(new Set(inventoryPlastics.map((i: any) => i.plastic))).filter(Boolean).sort() as string[]]
  const colorsList = ['Not Defined', ...Array.from(new Set(inventoryColors.map((i: any) => i.color))).filter(Boolean).sort() as string[]]
  const stampsList = ['Not Defined', ...Array.from(new Set(inventoryStamps.map((i: any) => i.stamp))).filter(Boolean).sort() as string[]]
  const stampFoilsList = ['Not Defined', ...Array.from(new Set(inventoryStampFoils.map((i: any) => i.stampFoil))).filter(Boolean).sort() as string[]]
  
  const locationsList = flatLocs.map(f => f.value)

  const activeFiltersCount = (searchQuery ? 1 : 0) + Object.values(searchP).filter(v => v !== undefined && v !== '').length - (searchP.view ? 1 : 0) - (searchP.sortBy ? 1 : 0) - (searchP.sortOrder ? 1 : 0) - (searchP.cols ? 1 : 0) - (searchP.page ? 1 : 0)



  return (
    <div className="flex flex-col h-full">
      <FilterPreserver vaultId={vaultId} />
      <div className="flex-shrink-0 mb-4 md:mb-8">
        <DashboardToolbar 
          brands={brandsList}
          categories={categoriesList}
          plastics={plasticsList}
          colors={colorsList}
          stamps={stampsList}
          stampFoils={stampFoilsList}
          collections={collections as any}
          availableLocations={locationsList}
          currentCollectionIds={[vaultId]}
          currentView={view}
          searchQuery={searchQuery}
          bagOptions={bagOptions}
          sortBy={sortBy}
          sortOrder={sortOrder}
          visibleColumns={visibleCols}
          useUserFlightNumbers={useUserFlightNumbers}
        />
      </div>

      <div className="flex-1 min-h-0">
        {totalCount === 0 ? (
          <div className="h-full overflow-auto text-center py-24 bg-white rounded-[32px] border-4 border-dashed border-slate-100 shadow-inner">
            <Disc className="mx-auto h-24 w-24 text-slate-200 mb-6 animate-spin-slow" />
          {activeFiltersCount > 0 ? (
            <>
              <h3 className="text-3xl font-black text-slate-900">No matching discs</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">Try adjusting your filters or search terms.</p>
              <div className="mt-10">
                <Link
                  href={`/v/${vaultId}`}
                  className="inline-flex items-center px-10 py-4 text-lg font-black rounded-2xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm"
                >
                  Clear Filters
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-3xl font-black text-slate-900">This vault is empty</h3>
              <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">Start adding discs to this specific collection.</p>
              <div className="mt-10">
                <Link
                  href={`/v/${vaultId}/add`}
                  className="inline-flex items-center px-10 py-4 text-lg font-black rounded-2xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm"
                >
                  Add your first disc
                </Link>
              </div>
            </>
          )}
        </div>
      ) : view === 'cards' ? (
        <div className="h-full overflow-auto">
          <InventoryInfiniteList 
            initialItems={inventory as any}
            where={whereClause}
            orderBy={getOrderBy(sortBy, sortOrder)}
            pageSize={pageSize}
            totalCount={totalCount}
            visibleColumns={visibleCols}
            categoryColors={categoryColors}
            bagPaths={bagPaths}
            useUserFlightNumbers={useUserFlightNumbers}
          />
        </div>
      ) : (
        <div className="h-full">
          <InventoryList 
            initialItems={inventory as any} 
            collections={collections as any}
            visibleColumns={visibleCols}
            sortBy={sortBy}
            where={whereClause}
            orderBy={getOrderBy(sortBy, sortOrder)}
            pageSize={pageSize}
            totalCount={totalCount}
            bagPaths={bagPaths}
            useUserFlightNumbers={useUserFlightNumbers}
          />
        </div>
      )}
      </div>
      <FloatingSearchButton />
    </div>
  )
}

