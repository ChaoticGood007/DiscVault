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
  searchParams: Promise<{ location?: string; vaultId?: string; showAll?: string }>
}

export default async function AllVaultsChartPage({ searchParams }: Props) {
  const { location, vaultId, showAll } = await searchParams

  // Fetch all vaults to show selection or aggregate bags
  const vaults = await prisma.discCollection.findMany({
    select: { id: true, name: true, locationTree: true }
  })

  // If no vault is selected, show a list of vaults to pick from
  if (!vaultId && !location) {
    const vaultBags = vaults.flatMap(v => {
      const tree: LocationNode[] = JSON.parse(v.locationTree || '[]')
      const flat = flattenTree(tree)
      return flat.map(loc => ({
        name: `${v.name}: ${loc.path}`,
        path: loc.value,
        vaultId: v.id,
        isInBag: loc.inBag
      }))
    })

    // Fetch counts for all these locations
    const counts = await prisma.inventory.groupBy({
      by: ['location', 'collectionId'],
      _count: true
    })

    const bagInfos = vaultBags.map(vb => {
      const match = counts.find(c => c.location === vb.path && c.collectionId === vb.vaultId)
      return {
        ...vb,
        count: match?._count ?? 0,
        // Update path to include vaultId for uniqueness in the global view
        fullPath: `v=${vb.vaultId}&l=${encodeURIComponent(vb.path)}`
      }
    }).filter(b => b.count > 0) // Only show bags with discs

    // We'll slightly adapt BagSelector for the "fullPath" handling
    // or just build a simpler one here. Let's use BagSelector but fix the link.
    
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Global Inventory</h2>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Select a Bag to Analyze</h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {bagInfos.filter(b => showAll === 'true' || b.isInBag).map((bag, idx) => (
            <Link 
              key={`${bag.vaultId}-${bag.path}`}
              href={`/v/all/chart?vaultId=${bag.vaultId}&location=${encodeURIComponent(bag.path)}`}
              className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase text-slate-500 tracking-widest">{vaults.find(v => v.id === bag.vaultId)?.name}</span>
                  {bag.isInBag && <span className="px-2 py-0.5 bg-indigo-50 rounded text-[8px] font-black uppercase text-indigo-600 tracking-widest">Active Bag</span>}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{bag.name.split(': ')[1]}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bag.count} Discs</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                View Flight Path <ChevronLeft className="w-3 h-3 rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // If vault and location are selected, show the chart
  const filteredDiscs = await prisma.inventory.findMany({
    where: { 
      collectionId: vaultId,
      location: location
    },
    include: { mold: true }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <Link 
          href={`/v/all/chart`}
          className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-indigo-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            Global Analysis &centerdot; {vaults.find(v => v.id === vaultId)?.name}
          </h2>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{location}</h1>
        </div>
      </div>
      
      <FlightChart discs={filteredDiscs as any} vaultId={vaultId!} />
    </div>
  )
}
