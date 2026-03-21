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
import Link from "next/link"
import { Inbox, Plus, Disc, ArrowRight, Settings, LayoutDashboard, Trash2 } from "lucide-react"
import { createCollection, deleteCollection } from "@/app/actions/collections"
import { Header } from "@/components/Header"

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const vaults = await prisma.discCollection.findMany({
    include: {
      _count: {
        select: { inventory: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 md:py-12">
        <div className="max-w-6xl mx-auto space-y-12 py-10">
          <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
          Your <span className="text-indigo-600">Vaults</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Select a workspace to manage your collection or create a new one to start fresh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* All Inventory Card */}
        <Link 
          href="/v/all"
          className="bg-indigo-600 p-10 rounded-[48px] shadow-xl shadow-indigo-100 flex flex-col group relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] text-white"
        >
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="p-5 bg-white/20 rounded-3xl backdrop-blur-md">
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-3xl font-black leading-tight">Total Inventory</h3>
            <p className="text-indigo-100 font-medium mt-3 leading-relaxed">
              View and search across all your vaults at once with multi-select filtering.
            </p>
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">
              Browse All
            </span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Create New Vault Card */}
        <div className="bg-white p-10 rounded-[48px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50">
          <div className="p-5 bg-indigo-50 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
            <Plus className="w-12 h-12 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-6">New Workspace</h3>
          <form action={createCollection} className="w-full space-y-4">
            <input 
              name="name" 
              placeholder="Vault Name (e.g. My Bag)" 
              required
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all border-none"
            />
            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
              Create Vault
            </button>
          </form>
        </div>

        {/* List of Vaults */}
        {vaults.map((vault) => (
          <div key={vault.id} className="group relative">
            <Link 
              href={`/v/${vault.id}`}
              className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 active:scale-[0.98] h-full"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-5 bg-slate-50 rounded-3xl group-hover:bg-indigo-600 transition-all duration-500">
                  <Inbox className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                  <Disc className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-black text-slate-900">{vault._count.inventory}</span>
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{vault.name}</h3>
                <p className="text-slate-500 font-medium mt-3 leading-relaxed line-clamp-2 italic">
                  {vault.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">
                  Enter Vault
                </span>
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </div>
              </div>

              {/* Decorative Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </Link>

            {/* Quick Actions (Delete) */}
            {vault.name !== 'Main Vault' && (
              <form 
                action={async () => { 'use server'; await deleteCollection(vault.id); }}
                className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button className="p-3 bg-white/80 backdrop-blur rounded-2xl text-slate-300 hover:text-red-500 transition-all hover:scale-110 shadow-sm border border-slate-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
      </main>
    </>
  )
}
