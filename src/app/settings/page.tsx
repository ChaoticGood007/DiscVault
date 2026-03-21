import ThemeCustomizer from './ThemeCustomizer'
import { getGlobalSettings } from '@/app/actions/settings'
import { Settings2, Database } from 'lucide-react'
import { Header } from "@/components/Header"
import SyncButton from '@/components/SyncButton'
import PrimaryVaultSelector from '@/components/PrimaryVaultSelector'
import { db as prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [settings, vaults] = await Promise.all([
    getGlobalSettings(),
    prisma.discCollection.findMany({ orderBy: { name: 'asc' } })
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
          <h2 className="text-lg font-black text-slate-900">Primary Workspace</h2>
          <p className="text-sm text-slate-500 font-medium max-w-[450px] mt-1">Designate the default DiscVault workspace loaded automatically when accessing the dashboard root.</p>
        </div>
        
        <PrimaryVaultSelector vaults={vaults} currentPrimary={settings.primaryVaultId} />
      </div>

      {/* Database Synchronization Module */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-black text-slate-900">Database Engine</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-[450px]">Force a manual synchronization against the upstream registry API. This systematically evaluates global repositories and securely merges newly identified disc data straight into your application's Master Molds table.</p>
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
