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
import { cookies } from "next/headers"
import Link from "next/link"
import { LayoutDashboard, BarChart3, Plus, Upload, Wind } from "lucide-react"
import { Header } from "@/components/Header"
import VaultSwitcher from "@/components/VaultSwitcher"
import ExportButton from "@/components/ExportButton"
import ClientInventoryLink from "@/components/ClientInventoryLink"

export default async function AllVaultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [totalCount, allVaults] = await Promise.all([
    prisma.inventory.count(),
    prisma.discCollection.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ])

  const cookieStore = await cookies()
  const savedFilter = cookieStore.get(`vault_filter_all`)?.value || ''
  const inventoryHref = savedFilter ? `/v/all?${savedFilter}` : `/v/all`

  const navItems = [
    { label: 'Total Inventory', href: inventoryHref, icon: LayoutDashboard },
    { label: 'Total Stats', href: `/v/all/stats`, icon: BarChart3 },
    { label: 'Total Chart', href: `/v/all/chart`, icon: Wind },
    { label: 'Add Disc', href: `/v/all/add`, icon: Plus },
    { label: 'Import', href: `/v/all/import`, icon: Upload },
  ]

  const navLinks = navItems.map((item) => {
    const Icon = item.icon
    const linkClasses = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all text-slate-600 hover:text-indigo-600 dark:hover:text-amber-500 group shrink-0"
    const content = (
      <>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-amber-500 transition-colors" />
        {item.label}
      </>
    )

    if (item.label === 'Total Inventory') {
      return (
        <ClientInventoryLink 
          key={item.href} 
          vaultId="all" 
          baseHref={item.href} 
          className={linkClasses}
        >
          {content}
        </ClientInventoryLink>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={linkClasses}
      >
        {content}
      </Link>
    )
  })

  return (
    <>
      <Header actions={<>{navLinks}<ExportButton variant="header" /></>}>
        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Global Vault</span>
        <VaultSwitcher vaults={allVaults} activeId="all" />
        <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-slate-100 rounded-md text-[8px] sm:text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] hidden sm:inline-block shrink-0">{totalCount} Discs</span>
      </Header>

      <main className="max-w-[1600px] w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col min-h-[calc(100vh-120px)]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col flex-1">
          {children}
        </div>
      </main>
    </>
  )
}
