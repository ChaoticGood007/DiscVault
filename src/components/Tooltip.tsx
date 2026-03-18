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

import { ReactNode, useState } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string | null | undefined
}

export default function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  if (!content) return <>{children}</>

  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div 
        className={`absolute bottom-full mb-3 flex flex-col items-center z-[100] pointer-events-none transition-all duration-200 ease-out transform ${
          visible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-1 scale-95'
        }`}
      >
        <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2.5 rounded-xl shadow-2xl whitespace-nowrap border border-slate-800">
          {content}
        </div>
        <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1.5 border-r border-b border-slate-800"></div>
      </div>
    </div>
  )
}
