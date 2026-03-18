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
import { createCollection, deleteCollection } from "@/app/actions/collections"
import { Inbox, Trash2, Plus, Disc, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Workspaces</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium">Create, edit, or delete your disc vaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {vaults.map((vault) => (
          <div key={vault.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                <Inbox className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{vault.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{vault._count.inventory} Discs</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <form action={async () => { 'use server'; await deleteCollection(vault.id); }}>
                <button className="p-4 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-90">
                  <Trash2 className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
