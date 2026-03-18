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

'use client'

import { updateDisc, deleteDisc } from '@/app/actions/inventory'
import { Trash2, Save, ArrowLeft, Inbox } from 'lucide-react'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
}

interface EditDiscFormProps {
  disc: {
    id: string
    collectionId: string | null
    weight: number | null
    color: string | null
    plastic: string | null
    stamp: string | null
    stampFoil: string | null
    location: string | null
    condition: number | null
    inBag: boolean
    ink: string | null
    notes: string | null
    mold: {
      name: string
      brand: string
      category: string
    }
  }
  collections: Collection[]
}

export default function EditDiscForm({ disc, collections }: EditDiscFormProps) {
  const handleUpdate = async (formData: FormData) => {
    await updateDisc(disc.id, formData)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this disc from your inventory?')) {
      await deleteDisc(disc.id, disc.collectionId || '')
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 mb-2">
            {disc.mold.brand}
          </span>
          <h2 className="text-3xl font-black text-slate-900">{disc.mold.name}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">{disc.mold.category}</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95 shadow-sm"
          title="Delete Disc"
        >
          <Trash2 className="h-6 w-6" />
        </button>
      </div>

      <form action={handleUpdate} className="space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-indigo-50 border border-slate-100 max-w-2xl mx-auto">
        {/* Collection Mover */}
        <div className="space-y-3 pb-8 border-b border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Inbox className="w-4 h-4" />
            <label className="text-xs font-black uppercase tracking-widest">Target Collection</label>
          </div>
          <select
            name="collectionId"
            defaultValue={disc.collectionId || ''}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="">No Collection</option>
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Weight (g)</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              defaultValue={disc.weight || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Plastic</label>
            <input
              type="text"
              name="plastic"
              defaultValue={disc.plastic || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Color</label>
            <input
              type="text"
              name="color"
              defaultValue={disc.color || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Stamp</label>
            <input
              type="text"
              name="stamp"
              defaultValue={disc.stamp || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Stamp Foil</label>
            <input
              type="text"
              name="stampFoil"
              defaultValue={disc.stampFoil || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Location</label>
            <input
              type="text"
              name="location"
              defaultValue={disc.location || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Condition (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              name="condition"
              defaultValue={disc.condition || ''}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Ink</label>
            <select
              name="ink"
              defaultValue={disc.ink || 'None'}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            >
              <option value="None">None</option>
              <option value="Rim">Rim</option>
              <option value="Flight Plate">Flight Plate</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 pb-4">
            <input
              type="checkbox"
              name="inBag"
              id="inBag"
              defaultChecked={disc.inBag}
              className="h-6 w-6 text-indigo-600 focus:ring-indigo-500 border-slate-200 rounded-lg"
            />
            <label htmlFor="inBag" className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Currently in Bag
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Notes</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={disc.notes || ''}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
          ></textarea>
        </div>

        <div className="pt-6 flex gap-4">
          <Link
            href="/"
            className="flex-1 inline-flex justify-center items-center px-8 py-5 text-base font-black rounded-2xl text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center"
          >
            <Save className="mr-2 h-6 w-6" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
