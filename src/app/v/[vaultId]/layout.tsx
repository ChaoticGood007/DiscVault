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
import { notFound } from "next/navigation"
import { LayoutDashboard, BarChart3, Plus, Upload, Inbox } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ vaultId: string }>
}) {
  const { vaultId } = await params

  const vault = await prisma.discCollection.findUnique({
    where: { id: vaultId },
    include: {
      _count: {
        select: { inventory: true }
      }
    }
  })

  if (!vault) {
    notFound()
  }

  const navItems = [
    { label: 'Inventory', href: `/v/${vaultId}`, icon: LayoutDashboard },
    { label: 'Analytics', href: `/v/${vaultId}/stats`, icon: BarChart3 },
    { label: 'Add Disc', href: `/v/${vaultId}/add`, icon: Plus },
    { label: 'Import', href: `/v/${vaultId}/import`, icon: Upload },
  ]

  return (
    <div className="flex flex-col h-[calc(100dvh-176px)] gap-8">
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Inbox className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 block">Active Workspace</span>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{vault.name}</h1>
            <p className="text-sm text-slate-500 font-medium">{vault._count.inventory} Discs in Vault</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:text-indigo-600 group"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
        {children}
      </div>
    </div>
  )
}
