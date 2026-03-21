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
import { LayoutDashboard, BarChart3, Plus, Upload, Inbox } from "lucide-react"

export default async function AllVaultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const totalCount = await prisma.inventory.count()

  const navItems = [
    { label: 'Total Inventory', href: `/v/all`, icon: LayoutDashboard },
    { label: 'Total Stats', href: `/v/all/stats`, icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-indigo-100 text-white">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] leading-none mb-1 block">Global Vault</span>
            <h1 className="text-3xl font-black leading-tight">All Vaults Combined</h1>
            <p className="text-sm text-indigo-200/60 font-medium">{totalCount} Discs across all collections</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:text-indigo-300 group"
              >
                <Icon className="w-4 h-4 text-white/40 group-hover:text-indigo-300 transition-colors" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  )
}
