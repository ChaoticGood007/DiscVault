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

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import DiscPreview from '@/components/DiscPreview'

interface Disc {
  id: string
  mold: {
    name: string
    brand: string
    category: string
    speed: number
    glide: number
    turn: number
    fade: number
  }
  color?: string | null
  secondaryColor?: string | null
  secondaryPattern?: string | null
  stampFoil?: string | null
  plastic?: string | null
  weight?: number | null
  userGlide?: number | null
  userTurn?: number | null
  userFade?: number | null
}

interface FlightChartProps {
  discs: Disc[]
  vaultId: string
}

export default function FlightChart({ discs, vaultId }: FlightChartProps) {
  const [hoveredDisc, setHoveredDisc] = useState<Disc | null>(null)
  const [useTunedNumbers, setUseTunedNumbers] = useState(true)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDotEnter = (disc: Disc) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setHoveredDisc(disc)
  }

  const handleDotLeave = () => {
    // Small delay to allow moving mouse into the tooltip bridge
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredDisc(null)
    }, 150)
  }

  const handleTooltipEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
  }

  const handleTooltipLeave = () => {
    setHoveredDisc(null)
  }

  // Configuration for the grid
  const STABILITY_MIN = 6
  const STABILITY_MAX = -6
  const SPEED_MIN = 0
  const SPEED_MAX = 15

  // Conversion functions for SVG space
  const getX = (val: number) => {
    // Stability: STABILITY_MIN (Left) to STABILITY_MAX (Right)
    const padding = 50
    const width = 800 - (padding * 2)
    const ratio = (val - STABILITY_MIN) / (STABILITY_MAX - STABILITY_MIN)
    return padding + (ratio * width)
  }

  const getY = (val: number) => {
    // Speed: SPEED_MIN (Bottom) to SPEED_MAX (Top)
    const padding = 50
    const height = 1000 - (padding * 2)
    const ratio = (val - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)
    return 1000 - (padding + (ratio * height))
  }

  // Map discs to plot points with jittering for overlap
  const plotPoints = useMemo(() => {
    // Group discs by their EFFECTIVE flight numbers (user overrides take priority if toggled)
    const coordMap: Record<string, Disc[]> = {}
    
    discs.forEach(disc => {
      if (!disc.mold) return
      const effectiveTurn = (useTunedNumbers && disc.userTurn !== null && disc.userTurn !== undefined) ? disc.userTurn : disc.mold.turn
      const effectiveFade = (useTunedNumbers && disc.userFade !== null && disc.userFade !== undefined) ? disc.userFade : disc.mold.fade
      const key = `${disc.mold.speed}-${effectiveTurn + effectiveFade}`
      if (!coordMap[key]) coordMap[key] = []
      coordMap[key].push(disc)
    })

    const points = Object.entries(coordMap).flatMap(([, groupedDiscs]) => {
      return groupedDiscs.map((disc, index) => {
        const effectiveTurn = (useTunedNumbers && disc.userTurn !== null && disc.userTurn !== undefined) ? disc.userTurn : disc.mold.turn
        const effectiveFade = (useTunedNumbers && disc.userFade !== null && disc.userFade !== undefined) ? disc.userFade : disc.mold.fade
        const stability = effectiveTurn + effectiveFade
        const speed = disc.mold.speed
        const isTuned = disc.userTurn !== null && disc.userTurn !== undefined 
                     || disc.userFade !== null && disc.userFade !== undefined 
                     || disc.userGlide !== null && disc.userGlide !== undefined

        // Improved jitter: if more than 1 disc, offset them slightly
        let jitterX = 0
        let jitterY = 0
        if (groupedDiscs.length > 1) {
          const angle = (index / groupedDiscs.length) * 2 * Math.PI
          const radius = 0.2 // slightly larger radius
          jitterX = Math.cos(angle) * radius
          jitterY = Math.sin(angle) * radius
        }

        return {
          disc,
          x: stability + jitterX,
          y: speed + jitterY,
          stability,
          speed,
          isTuned,
          labelYOffset: 22, // Default offset below the dot
          labelXOffset: 0
        }
      })
    })

    // Simple collision avoidance for labels
    // Sort points by y then x to process them in order
    const sortedPoints = [...points].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y))
    
    // We'll track occupied spaces for labels (very basic approximation)
    // Labels are roughly 60px wide and 15px tall in SVG space
    const occupiedSpaces: {x: number, y: number, w: number, h: number}[] = []

    // Map the coordinates of all disc dots to avoid label collisions with them
    sortedPoints.forEach(p => {
      const dotX = getX(p.x)
      const dotY = getY(p.y)
      occupiedSpaces.push({ x: dotX - 12, y: dotY - 12, w: 24, h: 24 })
    })

    return sortedPoints.map(point => {
      const px = getX(point.x)
      const py = getY(point.y)
      
      let finalYOffset = 22
      let finalXOffset = 0
      
      // Try to find a spot for the label
      const labelW = 60
      const labelH = 15
      
      const checkOverlap = (lx: number, ly: number) => {
        return occupiedSpaces.some(s => 
          lx < s.x + s.w && 
          lx + labelW > s.x && 
          ly < s.y + s.h && 
          ly + labelH > s.y
        )
      }

      // Try below, then above, then slightly offset
      const positions = [
        { x: px - labelW/2, y: py + 12 }, // Below
        { x: px - labelW/2, y: py - 25 }, // Above
        { x: px - labelW/2 + 30, y: py + 12 }, // Below Right
        { x: px - labelW/2 - 30, y: py + 12 }, // Below Left
      ]

      let foundPos = positions[0]
      for (const pos of positions) {
        if (!checkOverlap(pos.x, pos.y)) {
          foundPos = pos
          break
        }
      }

      occupiedSpaces.push({ ...foundPos, w: labelW, h: labelH })
      
      return {
        ...point,
        labelXOffset: foundPos.x - (px - labelW/2),
        labelYOffset: foundPos.y - py + (labelH/2) + 2
      }
    })
  }, [discs, useTunedNumbers])

  return (
    <div className="bg-white p-4 sm:p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col items-center">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-8 gap-4">
        <div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Bag Matrix</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vault Flight Chart</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-xs font-bold text-slate-400">
          <button
            onClick={() => setUseTunedNumbers(!useTunedNumbers)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <div className={`w-3 h-3 rounded-full transition-colors ${useTunedNumbers ? 'bg-amber-500' : 'bg-slate-300'}`} />
            <span className={useTunedNumbers ? 'text-amber-600' : 'text-slate-500'}>Use Tuned Numbers</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-4 border-l border-slate-200 pl-4">
             <div className="flex items-center gap-1.5 pt-1">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Disc Color</span>
             </div>
             <div className="flex items-center gap-1.5 pt-1">
                <div className="w-3 h-3 rounded-full border-2 border-amber-500" />
                <span>Tuned</span>
             </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[800px] aspect-[8/10]">
        <svg viewBox="0 0 800 1000" className="w-full h-full text-slate-400 fill-current">
          {/* Grid Lines - Stability (Vertical) */}
          {Array.from({ length: 13 }).map((_, i) => {
            const val = STABILITY_MIN - i
            const x = getX(val)
            return (
              <g key={`v-${val}`}>
                <line x1={x} y1={50} x2={x} y2={950} stroke="var(--dv-border)" strokeWidth={1} strokeDasharray={val === 0 ? "0" : "4 4"} opacity={val === 0 ? 0.5 : 0.2} />
                <text x={x} y={35} textAnchor="middle" className="text-[14px] font-black fill-current opacity-40">{val}</text>
              </g>
            )
          })}

          {/* Grid Lines - Speed (Horizontal) */}
          {Array.from({ length: 16 }).map((_, i) => {
            const val = i
            const y = getY(val)
            return (
              <g key={`h-${val}`}>
                <line x1={50} y1={y} x2={750} y2={y} stroke="var(--dv-border)" strokeWidth={1} strokeDasharray="4 4" opacity={0.2} />
                <text x={35} y={y + 5} textAnchor="end" className="text-[14px] font-black fill-current opacity-40">{val}</text>
              </g>
            )
          })}

          {/* Axes Labels */}
          <text x={400} y={15} textAnchor="middle" className="text-[10px] uppercase font-black tracking-[0.4em] fill-current opacity-60">Stability (Net: Turn + Fade)</text>
          <text x={15} y={500} textAnchor="middle" transform="rotate(-90, 15, 500)" className="text-[10px] uppercase font-black tracking-[0.4em] fill-current opacity-60">Speed Rating</text>

          {/* Plot Points */}
          {plotPoints.map((point, i) => {
            const isHovered = hoveredDisc?.id === point.disc.id
            const showLabel = discs.length <= 35 || isHovered
            const cx = getX(point.x)
            const cy = getY(point.y)

            return (
              <motion.g 
                key={`${point.disc.id}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.005, type: 'spring' }}
                onMouseEnter={() => handleDotEnter(point.disc)}
                onMouseLeave={handleDotLeave}
                className="cursor-pointer group"
              >
                <g transform={`translate(${cx - (isHovered ? 15 : 10)}, ${cy - (isHovered ? 15 : 10)})`}>
                  <DiscPreview 
                    color={point.disc.color}
                    secondaryColor={point.disc.secondaryColor}
                    secondaryPattern={point.disc.secondaryPattern}
                    stampFoil={point.disc.stampFoil}
                    size={isHovered ? 30 : 20}
                    isTuned={point.isTuned && useTunedNumbers}
                    isHovered={isHovered}
                    showTunedOutline={true}
                  />
                </g>
                
                {showLabel && (
                  <text 
                    x={cx + point.labelXOffset} 
                    y={cy + point.labelYOffset} 
                    textAnchor="middle" 
                    className={`text-[11px] font-black fill-current pointer-events-none transition-all duration-200 ${isHovered ? (point.isTuned && useTunedNumbers ? 'fill-amber-500' : 'fill-indigo-600') : ''}`}
                  >
                    {point.disc.mold.name}
                  </text>
                )}
              </motion.g>
            )
          })}
        </svg>

        {/* Hover Tooltip Overlay — Positioned relative to the dot */}
        <AnimatePresence>
          {hoveredDisc && (
            <motion.div
              layoutId="flight-tooltip"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-50 pointer-events-auto"
              // Calculate position based on the hovered disc's coordinates
              style={{
                left: `${(getX(plotPoints.find(p => p.disc.id === hoveredDisc.id)!.x) / 800) * 100}%`,
                top: `${(getY(plotPoints.find(p => p.disc.id === hoveredDisc.id)!.y) / 1000) * 100}%`,
                transform: 'translate(-50%, -105%)', // Position above the dot
              }}
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            >
              <div className="w-64 bg-slate-900 border border-slate-700 text-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Info className="w-12 h-12" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{hoveredDisc.mold.brand}</span>
                    <div className="h-1 w-1 bg-slate-600 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{hoveredDisc.plastic}</span>
                    {(hoveredDisc.userGlide !== null || hoveredDisc.userTurn !== null || hoveredDisc.userFade !== null) && useTunedNumbers && (
                      <>
                        <div className="h-1 w-1 bg-slate-600 rounded-full" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Tuned</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-black leading-none mb-1">{hoveredDisc.mold.name}</h3>
                  <div className="text-[10px] font-black text-slate-400 mb-4">{hoveredDisc.weight}g weight</div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: 'SPD', val: hoveredDisc.mold.speed, moldVal: hoveredDisc.mold.speed, isLocked: true },
                      { 
                        label: 'GLD', 
                        val: (useTunedNumbers && hoveredDisc.userGlide !== null && hoveredDisc.userGlide !== undefined) ? hoveredDisc.userGlide : hoveredDisc.mold.glide, 
                        moldVal: hoveredDisc.mold.glide 
                      },
                      { 
                        label: 'TRN', 
                        val: (useTunedNumbers && hoveredDisc.userTurn !== null && hoveredDisc.userTurn !== undefined) ? hoveredDisc.userTurn : hoveredDisc.mold.turn, 
                        moldVal: hoveredDisc.mold.turn 
                      },
                      { 
                        label: 'FAD', 
                        val: (useTunedNumbers && hoveredDisc.userFade !== null && hoveredDisc.userFade !== undefined) ? hoveredDisc.userFade : hoveredDisc.mold.fade, 
                        moldVal: hoveredDisc.mold.fade 
                      },
                    ].map(stat => {
                      const overridden = !stat.isLocked && stat.val !== stat.moldVal && useTunedNumbers
                      return (
                        <div key={stat.label} className={`p-1.5 rounded-lg flex flex-col items-center border transition-colors ${overridden ? 'bg-amber-950 border-amber-800' : 'bg-slate-800 border-transparent'}`}>
                          <span className={`text-[8px] font-black uppercase tracking-tighter ${overridden ? 'text-amber-500' : 'text-slate-500'}`}>{stat.label}</span>
                          <span className={`text-xs font-black ${overridden ? 'text-amber-100' : 'text-white'}`}>{stat.val}</span>
                          {overridden && <span className="text-[7px] text-amber-600 line-through opacity-60">{stat.moldVal}</span>}
                        </div>
                      )
                    })}
                  </div>

                  <Link 
                    href={`/v/${vaultId}/inventory/${hoveredDisc.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg"
                  >
                    View Disc <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              {/* Invisible bridge to prevent mouse-out when moving from dot to tooltip */}
              <div className="absolute left-1/2 bottom-[-20px] -translate-x-1/2 w-10 h-10" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-slate-400 max-w-sm">
        <p className="text-[10px] font-medium leading-relaxed">
          The Flight Chart visualizes your bag&apos;s distribution across the stability spectrum. High-speed discs populate the top while overstable utilities cluster to the left.
        </p>
      </div>
    </div>
  )
}
