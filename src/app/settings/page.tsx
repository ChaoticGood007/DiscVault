import ThemeCustomizer from './ThemeCustomizer'
import { getGlobalSettings } from '@/app/actions/settings'
import { Settings2 } from 'lucide-react'
import { Header } from "@/components/Header"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getGlobalSettings()

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
    </div>
      </main>
    </>
  )
}
