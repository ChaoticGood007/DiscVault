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

import { useId, useMemo, useState } from 'react'
import { parseDiscColor } from '@/lib/colorParser'
import { motion } from 'framer-motion'
import PreviewModal from './PreviewModal'

interface DiscPreviewProps {
  color?: string | null
  secondaryColor?: string | null
  secondaryPattern?: string | null
  stampFoil?: string | null
  size?: number
  className?: string
  isTuned?: boolean
  isHovered?: boolean
  showTunedOutline?: boolean
  hoverScale?: number
  seed?: string | number | null
  disc?: {
    mold: {
      name: string
      brand: string
    }
    plastic?: string | null
    weight?: number | null
  }
}

export default function DiscPreview({
  color,
  secondaryColor,
  secondaryPattern,
  stampFoil,
  size = 24,
  className = '',
  isTuned = false,
  isHovered = false,
  showTunedOutline = false,
  hoverScale = 1.25,
  seed,
  disc
}: DiscPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const baseColor = parseDiscColor(color)
  const secColor = parseDiscColor(secondaryColor)
  const foilColor = parseDiscColor(stampFoil)
  
  // We'll use a coordinate system from -50 to 50 for the internal rendering
  // This makes the math easier regardless of the display size
  const radius = 40
  const pattern = secondaryPattern
  const generatedId = useId()
  const clipId = `disc-clip-${generatedId.replace(/:/g, '')}`

  // Stable random dot generator for Speckled pattern
  const dots = useMemo(() => {
    if (pattern !== 'Speckled' || !secondaryColor) return []
    
    // Simple deterministic random based on seed or baseColor/secColor strings
    const seedString = String(seed || (baseColor + secColor))
    let hash = 0
    for (let i = 0; i < seedString.length; i++) {
      hash = ((hash << 5) - hash) + seedString.charCodeAt(i)
      hash |= 0 
    }
    
    const random = () => {
      hash = (hash * 16807) % 2147483647
      return (hash - 1) / 2147483646
    }
    
    const dotCount = 80 // A bit more for a nice speckled look
    return Array.from({ length: dotCount }).map(() => {
      const r = Math.sqrt(random()) * radius
      const theta = random() * 2 * Math.PI
      return {
        cx: r * Math.cos(theta),
        cy: r * Math.sin(theta),
        r: 0.2 + random() * 1.0,
        opacity: 0.3 + random() * 0.6
      }
    })
  }, [pattern, secondaryColor, seed, baseColor, secColor, radius])

  return (
    <>
      <motion.svg 
        viewBox="-50 -50 100 100" 
        width={size} 
        height={size} 
        className={`overflow-visible ${disc ? 'cursor-pointer' : ''} ${className}`}
        whileHover={{ scale: hoverScale, zIndex: 50 }}
        onClick={(e) => {
          if (disc) {
            e.stopPropagation()
            e.preventDefault()
            setIsModalOpen(true)
          }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle r={radius} />
          </clipPath>
        </defs>

        {/* Tuned Glow/Stroke Base */}
        {isHovered && <circle r={radius + 8} fill="none" stroke="white" strokeWidth={6} className="drop-shadow-xl" />}
        {isTuned && showTunedOutline && !isHovered && <circle r={radius + 4} fill="none" stroke="#f59e0b" strokeWidth={4} opacity={0.6} />}
        {isTuned && showTunedOutline && isHovered && <circle r={radius + 6} fill="none" stroke="#f59e0b" strokeWidth={6} />}

        {/* Base Disc */}
        <circle r={radius} fill={pattern === 'Halo' ? secColor : baseColor} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />

        {/* Secondary Patterns - Clipped to disc bounds */}
        <g clipPath={`url(#${clipId})`}>
          {pattern === 'Halo' && secondaryColor && (
            <circle r={radius * 0.75} fill={baseColor} />
          )}
          {pattern === 'Burst' && secondaryColor && (
            <circle r={radius * 0.6} fill={secColor} opacity={0.7} />
          )}
          {pattern === 'Split' && secondaryColor && (
            <path d={`M 0 -${radius} A ${radius} ${radius} 0 0 1 0 ${radius} Z`} fill={secColor} />
          )}
          {pattern === 'Speckled' && secondaryColor && (
            <g>
              {dots.map((dot, i) => (
                <circle 
                  key={i}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  fill={secColor}
                  opacity={dot.opacity}
                />
              ))}
            </g>
          )}
          {pattern === 'Swirl' && secondaryColor && (
            <>
              {/* Layer 1: Thick base blend */}
              <path 
                d={`M -${radius} -${radius/2} Q 0 0, ${radius} ${radius/2} T -${radius} ${radius*1.5}`} 
                fill={secColor} 
                opacity={0.3} 
              />
              {/* Layer 2: Main swirl wisps */}
              <path 
                d={`M -${radius} 0 C -${radius/2} -${radius}, ${radius/2} ${radius}, ${radius} 0 S ${radius*1.5} -${radius}, 0 0`} 
                stroke={secColor} 
                strokeWidth={radius * 0.4} 
                fill="none" 
                opacity={0.6} 
                strokeLinecap="round"
              />
              <path 
                d={`M ${radius} 0 C ${radius/2} ${radius}, -${radius/2} -${radius}, -${radius} 0 S -${radius*1.5} ${radius}, 0 0`} 
                stroke={baseColor} 
                strokeWidth={radius * 0.2} 
                fill="none" 
                opacity={0.4} 
                strokeLinecap="round"
              />
              {/* Layer 3: Finer detail wisps */}
              <path 
                d={`M -${radius} ${radius/3} Q 0 -${radius/2}, ${radius} -${radius/3}`} 
                stroke={secColor} 
                strokeWidth={radius * 0.1} 
                fill="none" 
                opacity={0.8}
              />
            </>
          )}
        </g>

        {/* Stamp Foil - Thicker with slight offset for "shine" effect */}
        {stampFoil && (
          <g opacity={0.9}>
            <circle r={radius * 0.4} stroke="rgba(0,0,0,0.1)" strokeWidth={4} fill="none" />
            <circle r={radius * 0.4} stroke={foilColor} strokeWidth={3.5} fill="none" />
          </g>
        )}
      </motion.svg>

      {disc && (
        <PreviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          disc={{
            ...disc,
            color,
            secondaryColor,
            secondaryPattern,
            stampFoil
          }} 
        />
      )}
    </>
  )
}
