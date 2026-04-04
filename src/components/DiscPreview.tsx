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

import { useId } from 'react'
import { parseDiscColor } from '@/lib/colorParser'
import { motion } from 'framer-motion'

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
  hoverScale = 1.25
}: DiscPreviewProps) {
  const baseColor = parseDiscColor(color)
  const secColor = parseDiscColor(secondaryColor)
  const foilColor = parseDiscColor(stampFoil)
  
  // We'll use a coordinate system from -50 to 50 for the internal rendering
  // This makes the math easier regardless of the display size
  const radius = 40 
  const pattern = secondaryPattern
  const generatedId = useId()
  const clipId = `disc-clip-${generatedId.replace(/:/g, '')}`

  return (
    <motion.svg 
      viewBox="-50 -50 100 100" 
      width={size} 
      height={size} 
      className={`overflow-visible ${className}`}
      whileHover={{ scale: hoverScale, zIndex: 50 }}
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
  )
}
