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

import { getInventoryStats } from "@/lib/analytics"
import StatsCharts from "@/components/StatsCharts"
import { BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ScopedStatsPage({
  params,
}: {
  params: Promise<{ vaultId: string }>
}) {
  const { vaultId } = await params
  const stats = await getInventoryStats(vaultId)

  if (!stats) {
    return (
      <div className="text-center py-24 bg-white rounded-[32px] border-4 border-dashed border-slate-100 shadow-inner">
        <BarChart3 className="mx-auto h-24 w-24 text-slate-200 mb-6" />
        <h3 className="text-3xl font-black text-slate-900">No data for stats</h3>
        <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">This vault needs some discs before we can generate analytics.</p>
        <div className="mt-10">
          <Link
            href={`/v/${vaultId}/add`}
            className="inline-flex items-center px-10 py-4 text-lg font-black rounded-2xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm"
          >
            Add your first disc
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Discs', value: stats.totalDiscs },
          { label: 'Manufacturers', value: stats.brands.length },
          { label: 'Categories', value: stats.categories.length },
          { label: 'Avg Condition', value: `${stats.avgCondition}/10` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-3xl font-black text-slate-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em]">Vault Trivia</span>
          <h2 className="text-2xl font-black mt-1">Deep Collection Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-16 relative z-10">
          <div>
            <span className="block text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Total Payload</span>
            <span className="text-3xl font-black">{stats.totalWeightKg} <span className="text-sm font-bold opacity-60">kg</span></span>
            <p className="text-[10px] text-indigo-100/60 font-medium mt-1">That's ~{(parseFloat(stats.totalWeightKg) * 2.204).toFixed(1)} lbs of plastic!</p>
          </div>
          <div>
            <span className="block text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Top Manufacturer</span>
            <span className="text-3xl font-black">{stats.brands[0]?.name}</span>
            <p className="text-[10px] text-indigo-100/60 font-medium mt-1">Most common brand in this vault</p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </div>

      <StatsCharts stats={stats} />
    </div>
  )
}
