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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import CollectionCard from "@/components/CollectionCard"

export const dynamic = 'force-dynamic'

export default async function CollectionsPage() {
  const vaults = await prisma.discCollection.findMany({
    include: {
      _count: {
        select: { inventory: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Selection
        </Link>
      </div>

      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Vaults</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium">Create, edit, or delete your disc vaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {vaults.map((vault) => (
          <CollectionCard 
            key={vault.id} 
            vault={vault} 
            count={vault._count.inventory} 
          />
        ))}
      </div>
    </div>
  )
}
