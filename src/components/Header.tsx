import Link from 'next/link';
import { Settings } from 'lucide-react';

export function Header({ 
  children, 
  actions 
}: { 
  children?: React.ReactNode; 
  actions?: React.ReactNode;
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform shrink-0">
                <span className="text-white font-black text-xl italic italic-vault">DV</span>
              </div>
              <span className={`text-2xl font-black text-slate-900 tracking-tighter shrink-0 ${children ? 'hidden sm:inline-block' : 'inline-block'}`}>DiscVault</span>
            </Link>
            
            {/* Inject Vault Metadata */}
            {children && (
               <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 ml-3 sm:ml-6 border-l border-slate-200 min-w-0 max-w-[180px] xs:max-w-none">
                 {children}
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-4 shrink-0 bg-white">

             {/* Dynamic Sub-Navigation Links */}
             {actions && (
               <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto w-full no-scrollbar whitespace-nowrap">
                 {actions}
               </div>
             )}
             
             {/* Global settings icons */}
             <div className="flex items-center gap-1 sm:gap-2 shrink-0">
               {actions && (
                 <div className="hidden md:block lg:hidden pl-2 border-l border-slate-200 mr-1" />
               )}
               <Link href="/settings" className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
                 <Settings className="w-5 h-5" />
               </Link>
             </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Actions Dropdown - Fixed below Top bar */}
      {actions && (
        <div className="lg:hidden w-full border-t border-slate-100 bg-slate-50/50 px-4 py-2 overflow-x-auto no-scrollbar whitespace-nowrap flex items-center gap-1">
           {actions}
        </div>
      )}
    </header>
  );
}
