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

'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#6366f1', '#4338ca'];

interface StatsChartsProps {
  stats: {
    totalDiscs: number
    brands: { name: string; value: number }[]
    categories: { name: string; value: number }[]
    speeds: { name: number; value: number }[]
  }
}

export default function StatsCharts({ stats }: StatsChartsProps) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Brand Distribution Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 h-[450px]">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Inventory by Brand</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.brands} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={140}
                interval={0}
                tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" name="Discs" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 h-[450px]">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={stats.categories}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              >
                {stats.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speed Distribution Chart */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 h-[400px]">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Inventory by Speed Rating</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={stats.speeds}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 'bold', fill: '#0f172a' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 'bold', fill: '#0f172a' }} 
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" name="Discs" fill="#818cf8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
