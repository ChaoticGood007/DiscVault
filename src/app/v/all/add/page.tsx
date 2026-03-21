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
import AddDiscForm from "@/components/AddDiscForm"
import { Inbox } from "lucide-react"
import { getLocationTree } from "@/app/actions/settings"

export const dynamic = 'force-dynamic'

export default async function AllVaultsAddPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchP = await searchParams
  const collectionId = typeof searchP.collection === 'string' ? searchP.collection : undefined

  const [collections, tree] = await Promise.all([
    prisma.discCollection.findMany({ orderBy: { name: 'asc' } }),
    getLocationTree(),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Add New Disc</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Create a new entry in your global inventory. Please select a vault first.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 text-slate-400">
          <Inbox className="w-6 h-6" />
          <span className="text-xs font-black uppercase tracking-widest">Select Target Vault</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/v/all/add?collection=${col.id}`}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                collectionId === col.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {col.name}
            </Link>
          ))}
        </div>
      </div>

      {collectionId ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AddDiscForm vaultId={collectionId} tree={tree} />
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-4 border-dashed border-white">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Waiting for vault selection...</p>
        </div>
      )}
    </div>
  )
}

import Link from "next/link"
