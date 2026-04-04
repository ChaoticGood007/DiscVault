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
import FlightChart from "@/components/FlightChart"
import BagSelector from "@/components/BagSelector"
import { flattenTree, type LocationNode } from "@/lib/locationTree"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ vaultId: string }>
  searchParams: Promise<{ location?: string; showAll?: string }>
}

export default async function VaultChartPage({ params, searchParams }: Props) {
  const { vaultId } = await params
  const { location, showAll } = await searchParams

  // Fetch vault and its location tree
  const vault = await prisma.discCollection.findUnique({
    where: { id: vaultId },
    select: { locationTree: true, name: true }
  })

  if (!vault) return <div>Vault not found</div>

  const tree: LocationNode[] = JSON.parse(vault.locationTree || '[]')
  const flatLocations = flattenTree(tree)

  // Fetch all discs to count them per location
  const allDiscs = await prisma.inventory.findMany({
    where: { collectionId: vaultId },
    include: { mold: true }
  })

  // If no location is selected, show the BagSelector
  if (!location) {
    const bagInfos = flatLocations.map(loc => ({
      name: loc.path,
      path: loc.value,
      count: allDiscs.filter(d => d.location === loc.value).length,
      isInBag: loc.inBag
    })).filter(b => b.count > 0) // Only show bags with discs

    return (
      <BagSelector 
        bags={bagInfos} 
        baseUrl={`/v/${vaultId}/chart`} 
        showAll={showAll === 'true'} 
      />
    )
  }

  // If location is selected, filter discs and show the chart
  const filteredDiscs = allDiscs.filter(d => d.location === location)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <Link 
          href={`/v/${vaultId}/chart`}
          className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-indigo-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bag Analysis</h2>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{location}</h1>
        </div>
      </div>
      
      <FlightChart discs={filteredDiscs as any} vaultId={vaultId} />
    </div>
  )
}
