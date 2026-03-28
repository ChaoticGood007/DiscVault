'use client'

import { Edit3, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DiscDetailViewProps {
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
    ink: string | null
    notes: string | null
    createdAt: Date
    mold: {
      name: string
      brand: string
      category: string
      speed: number
      glide: number
      turn: number
      fade: number
    }
  }
  categoryColors: Record<string, string>
  vaultId: string
  bagPaths?: string[]
}

export default function DiscDetailView({ disc, categoryColors, vaultId, bagPaths = [] }: DiscDetailViewProps) {
  const router = useRouter()
  const categoryColor = categoryColors[disc.mold.category] || '#cbd5e1'

  const isInBag = (loc: string | null) => {
    if (!loc) return false
    return bagPaths.some(p => loc === p || loc.startsWith(p + '/'))
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-100 border border-slate-100 overflow-hidden relative flex flex-col md:flex-row">
        {/* Category Color Accent */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-4 z-10"
          style={{ backgroundColor: categoryColor }} 
        />

        <div className="p-8 md:p-12 pl-12 md:pl-16 flex-1">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-12">
            <div>
              <span className="inline-flex items-center px-4 h-[32px] rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 border border-indigo-100 mb-5 shadow-sm">
                {disc.mold.brand}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                {disc.mold.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">{disc.mold.category}</span>
                {isInBag(disc.location) && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">In Bag</span>
                  </>
                )}
              </div>
            </div>

            {/* Flight Numbers */}
            <div className="flex space-x-3 bg-slate-50 p-5 rounded-3xl border border-slate-100 shrink-0">
              {[
                { key: 'speed', val: disc.mold.speed },
                { key: 'glide', val: disc.mold.glide },
                { key: 'turn', val: disc.mold.turn },
                { key: 'fade', val: disc.mold.fade }
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-slate-900 font-black text-xl border border-slate-200 shadow-sm">
                    {stat.val}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 mt-2.5 uppercase tracking-widest">{stat.key}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 border-t border-slate-100 pt-10 mt-10">
            <div className="space-y-2">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</span>
              <span className="block text-xl font-black text-slate-900">{disc.weight ? `${disc.weight}g` : '—'}</span>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Plastic</span>
              <span className="block text-xl font-black text-slate-900">{disc.plastic || '—'}</span>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</span>
              <div className="flex items-center gap-2 mt-1">
                {disc.color && (
                  <div 
                    className="w-5 h-5 rounded-full border border-slate-200 shrink-0 shadow-sm" 
                    style={{ backgroundColor: disc.color.toLowerCase().includes('/') ? disc.color.split('/')[0] : disc.color }}
                  />
                )}
                <span className="block text-xl font-black text-slate-900 leading-none">{disc.color || '—'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</span>
              <span className="block text-xl font-black text-slate-900">{disc.condition ? `${disc.condition}/10` : '—'}</span>
            </div>
            
            <div className="space-y-2 border-t border-slate-50 pt-8 md:border-t-0 md:pt-0">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Stamp</span>
              <span className="block text-xl font-black text-slate-900">{disc.stamp || 'Stock'}</span>
            </div>
            <div className="space-y-2 border-t border-slate-50 pt-8 md:border-t-0 md:pt-0">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Foil</span>
              <span className="block text-xl font-black text-slate-900">{disc.stampFoil || '—'}</span>
            </div>
            <div className="space-y-2 border-t border-slate-50 pt-8 md:border-t-0 md:pt-0">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ink</span>
              <span className="block text-xl font-black text-slate-900">{disc.ink || 'None'}</span>
            </div>
            <div className="space-y-2 border-t border-slate-50 pt-8 md:border-t-0 md:pt-0">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</span>
              <span className="block text-xl font-black text-slate-900">{disc.location || '—'}</span>
            </div>
          </div>

          {disc.notes && (
            <div className="mt-12 p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative">
              <div className="absolute -top-3.5 left-8 bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100 shadow-sm">
                Owner Notes
              </div>
              <p className="text-slate-700 leading-relaxed font-medium mt-2">{disc.notes}</p>
            </div>
          )}

          <div className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
            Added {new Date(disc.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 inline-flex justify-center items-center px-8 py-5 text-base font-black rounded-2xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Vault
        </button>
        <Link
          href={`/v/${vaultId}/inventory/${disc.id}/edit`}
          className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center text-lg gap-3"
        >
          <Edit3 className="w-5 h-5" />
          Edit Disc Metadata
        </Link>
      </div>
    </div>
  )
}
