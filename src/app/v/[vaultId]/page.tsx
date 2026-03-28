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
  
  const category = typeof searchP.category === 'string' ? searchP.category : undefined
  const brand = typeof searchP.brand === 'string' ? searchP.brand : undefined
  const view = typeof searchP.view === 'string' ? searchP.view : 'cards'
  const sortBy = (typeof searchP.sortBy === 'string' ? searchP.sortBy : 'createdAt') as SortField
  const sortOrder = (typeof searchP.sortOrder === 'string' ? searchP.sortOrder : 'desc') as SortOrder

  const cookieStore = await cookies()
  const savedColsCookie = cookieStore.get('discVaultVisibleCols')
  const cookieCols = savedColsCookie ? savedColsCookie.value.split(',') : DEFAULT_COLUMNS
  const colsParam = typeof searchP.cols === 'string' ? searchP.cols.split(',') : cookieCols
  const visibleCols = colsParam.includes('name') ? colsParam : ['name', ...colsParam]
  const searchQuery = typeof searchP.search === 'string' ? searchP.search : undefined
  const inBagParam = typeof searchP.inBag === 'string' ? searchP.inBag : undefined

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
  const plasticFilter = typeof searchP.plastic === 'string' ? searchP.plastic : undefined
  const colorFilter = typeof searchP.color === 'string' ? searchP.color : undefined
  const stampFilter = typeof searchP.stamp === 'string' ? searchP.stamp : undefined
  const stampFoilFilter = typeof searchP.stampFoil === 'string' ? searchP.stampFoil : undefined
  const locationsFilter = typeof searchP.locations === 'string' ? searchP.locations.split(',').filter(Boolean) : []

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

  const andConditions: any[] = []

  if (searchQuery) {
    andConditions.push({
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
    })
  }

  const addNullableMultiSelect = (field: string, filterStr?: string) => {
    if (!filterStr) return;
    const values = filterStr.split(',').filter(Boolean);
    if (values.length === 0) return;
    const hasNotDefined = values.includes('Not Defined');
    const valid = values.filter(v => v !== 'Not Defined');
    if (hasNotDefined) {
      const orConditions: any[] = [{ [field]: null }, { [field]: '' }];
      if (valid.length > 0) {
        orConditions.push({ [field]: { in: valid } });
      }
      andConditions.push({ OR: orConditions });
    } else {
      andConditions.push({ [field]: { in: values } });
    }
  }

  addNullableMultiSelect('plastic', plasticFilter);
  addNullableMultiSelect('color', colorFilter);
  addNullableMultiSelect('stamp', stampFilter);
  addNullableMultiSelect('stampFoil', stampFoilFilter);

  // Bag / Location logic
  if (inBagParam === 'true') {
    if (bagPaths.length > 0) {
      andConditions.push({
        OR: bagPaths.flatMap(p => [
          { location: p },
          { location: { startsWith: p + '/' } }
        ])
      })
    } else {
      andConditions.push({ id: 'none' })
    }
  } else if (inBagParam === 'false') {
    if (bagPaths.length > 0) {
      andConditions.push({
        NOT: { OR: bagPaths.flatMap(p => [
          { location: p },
          { location: { startsWith: p + '/' } }
        ])}
      })
    }
  } else if (inBagParam) {
    andConditions.push({
      OR: [
        { location: inBagParam },
        { location: { startsWith: inBagParam + '/' } }
      ]
    })
  } else if (locationsFilter.length > 0) {
    andConditions.push({ location: { in: locationsFilter } })
  }

  const whereClause: any = {
    collectionId: vaultId,
    weight: (minWeight !== undefined || maxWeight !== undefined) ? { gte: minWeight, lte: maxWeight } : undefined,
    condition: (minCond !== undefined || maxCond !== undefined) ? { gte: minCond, lte: maxCond } : undefined,
    ink: inkFilter === 'none' ? { equals: 'None' } : inkFilter === 'exists' ? { not: 'None' } : undefined,
    mold: {
      brand: brand ? { in: brand.split(',') } : undefined,
      category: category ? { in: category.split(',') } : undefined,
      speed: (minSpeed !== undefined || maxSpeed !== undefined) ? { gte: minSpeed, lte: maxSpeed } : undefined,
      glide: (minGlide !== undefined || maxGlide !== undefined) ? { gte: minGlide, lte: maxGlide } : undefined,
      turn: (minTurn !== undefined || maxTurn !== undefined) ? { gte: minTurn, lte: maxTurn } : undefined,
      fade: (minFade !== undefined || maxFade !== undefined) ? { gte: minFade, lte: maxFade } : undefined,
    },
    AND: andConditions.length > 0 ? andConditions : undefined,
  }

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

  const activeFiltersCount = (category ? category.split(',').length : 0) + (brand ? brand.split(',').length : 0) + (searchQuery ? 1 : 0) + (inBagParam ? 1 : 0) + Object.values(searchP).filter(v => v !== undefined && v !== '').length - (searchP.view ? 1 : 0) - (searchP.sortBy ? 1 : 0) - (searchP.sortOrder ? 1 : 0) - (searchP.cols ? 1 : 0) - (searchP.page ? 1 : 0)



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
          currentCategory={category}
          currentBrand={brand}
          currentView={view}
          searchQuery={searchQuery}
          currentBag={inBagParam}
          bagOptions={bagOptions}
          advancedFilters={{
          minSpeed, maxSpeed,
          minGlide, maxGlide,
          minTurn, maxTurn,
          minFade, maxFade,
          minWeight, maxWeight,
          minCond, maxCond,
          ink: inkFilter,
          plastic: plasticFilter,
          color: colorFilter,
          stamp: stampFilter,
          locations: locationsFilter.length ? locationsFilter.join(',') : undefined,
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        visibleColumns={visibleCols}
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
          />
        </div>
      )}
      </div>
      <FloatingSearchButton />
    </div>
  )
}

