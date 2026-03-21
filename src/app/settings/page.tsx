import ThemeCustomizer from './ThemeCustomizer'
import { getGlobalSettings, getLocationTree } from '@/app/actions/settings'
import { Settings2, Database, MapPin } from 'lucide-react'
import { Header } from "@/components/Header"
import SyncButton from '@/components/SyncButton'
import PrimaryVaultSelector from '@/components/PrimaryVaultSelector'
import LocationTreeEditor from '@/components/LocationTreeEditor'
import LocationMigrator from '@/components/LocationMigrator'
import { db as prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [settings, vaults, locationTree] = await Promise.all([
    getGlobalSettings(),
    prisma.discCollection.findMany({ orderBy: { name: 'asc' } }),
    getLocationTree(),
  ])

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Settings2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 block">Configuration</span>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Global Settings</h1>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-6 gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Accent Color</h2>
            <p className="text-sm text-slate-500 font-medium max-w-sm mt-1">Select the primary brand color used for buttons, borders, active states, and backgrounds throughout the application.</p>
          </div>
        </div>
        
        <ThemeCustomizer initialHex={settings.accentColor} />
      </div>

      {/* Primary Vault Configuration Module */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="border-b border-slate-50 pb-6">
          <h2 className="text-lg font-black text-slate-900">Primary Vault</h2>
          <p className="text-sm text-slate-500 font-medium max-w-[450px] mt-1">Designate the default DiscVault vault loaded automatically when accessing the dashboard root.</p>
        </div>
        
        <PrimaryVaultSelector vaults={vaults} currentPrimary={settings.primaryVaultId} />
      </div>

      {/* Location Tree Module */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="border-b border-slate-50 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-black text-slate-900">Location Tree</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-[480px] mt-1">
            Define a hierarchy of storage locations (e.g. <span className="font-bold text-slate-700">Zac&apos;s Bag / Main Pocket</span>). Mark any node as a bag location — discs assigned there will automatically be flagged &quot;In Bag&quot;. Children inherit the bag flag from their parent.
          </p>
        </div>
        <LocationTreeEditor initialTree={locationTree} />
        <div className="border-t border-slate-50 pt-5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">One-Time Migration</p>
          <LocationMigrator />
        </div>
      </div>

      {/* Database Synchronization Module */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-black text-slate-900">Database Engine</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-[450px]">Force a manual synchronization against the upstream registry API. This systematically evaluates global repositories and securely merges newly identified disc data straight into your application&apos;s Master Molds table.</p>
          </div>
        </div>
        
        <div className="flex justify-start">
          <SyncButton />
        </div>
      </div>
    </div>
      </main>
    </>
  )
}
