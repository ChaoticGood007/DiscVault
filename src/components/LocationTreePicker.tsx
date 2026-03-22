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

import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, MapPin, Check, Minus } from 'lucide-react'
import { buildTreeFromPaths, type LocationNode } from '@/lib/locationTree'

interface LocationTreePickerProps {
  availableLocations: string[]
  selectedLocations: string[]
  onChange: (locations: string[]) => void
  className?: string
}

/**
 * Returns ALL selectable values under this node — the node's own value PLUS
 * all descendant values. This ensures that clicking a parent folder selects
 * both discs assigned directly to the folder AND all nested children.
 */
function getNodeValues(node: LocationNode, selfValue: string, availableLocations: Set<string>): string[] {
  const result: string[] = []
  // Include the node itself if it exists in the real available locations
  if (availableLocations.has(selfValue)) result.push(selfValue)
  // Include all descendants recursively
  for (const child of node.children) {
    result.push(...getNodeValues(child, `${selfValue}/${child.label}`, availableLocations))
  }
  return result
}

interface TreeNodeProps {
  node: LocationNode
  nodeValue: string
  depth: number
  selectedLocations: string[]
  availableSet: Set<string>
  onToggle: (values: string[], selected: boolean) => void
}

function TreeNodeRow({ node, nodeValue, depth, selectedLocations, availableSet, onToggle }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  // Get all selectable values under this node (self + all descendants that exist in DB)
  const myValues = getNodeValues(node, nodeValue, availableSet)
  const selectedCount = myValues.filter(v => selectedLocations.includes(v)).length
  const isFullySelected = selectedCount === myValues.length && selectedCount > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < myValues.length

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle(myValues, !isFullySelected)
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(p => !p)
  }

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-colors group ${
          isFullySelected
            ? 'bg-indigo-50 text-indigo-700'
            : isPartiallySelected
              ? 'bg-slate-50 text-slate-700'
              : 'hover:bg-slate-50 text-slate-600'
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={handleToggle}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleExpand}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Folder / leaf icon */}
        {hasChildren ? (
          expanded
            ? <FolderOpen className="w-4 h-4 shrink-0 text-amber-400" />
            : <Folder className="w-4 h-4 shrink-0 text-amber-400" />
        ) : (
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-300" />
        )}

        {/* Label */}
        <span className="flex-1 text-xs font-bold truncate">{node.label}</span>

        {/* Check / partial indicator */}
        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
          isFullySelected
            ? 'bg-indigo-600 border-indigo-600'
            : isPartiallySelected
              ? 'bg-slate-200 border-slate-300'
              : 'border-slate-200 group-hover:border-slate-300'
        }`}>
          {isFullySelected && <Check className="w-2.5 h-2.5 text-white" />}
          {isPartiallySelected && <Minus className="w-2.5 h-2.5 text-slate-500" />}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map(child => (
            <TreeNodeRow
              key={child.id}
              node={child}
              nodeValue={`${nodeValue}/${child.label}`}
              depth={depth + 1}
              selectedLocations={selectedLocations}
              availableSet={availableSet}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LocationTreePicker({
  availableLocations,
  selectedLocations,
  onChange,
  className,
}: LocationTreePickerProps) {
  // Build tree structure from available flat location strings
  const tree = buildTreeFromPaths(availableLocations)
  const availableSet = new Set(availableLocations)

  if (tree.length === 0) return null

  const handleToggle = (values: string[], shouldSelect: boolean) => {
    if (shouldSelect) {
      const next = Array.from(new Set([...selectedLocations, ...values]))
      onChange(next)
    } else {
      onChange(selectedLocations.filter(v => !values.includes(v)))
    }
  }

  return (
    <div className={`rounded-2xl border border-slate-100 overflow-y-auto bg-white max-h-44 ${className ?? ''}`}>
      {tree.map(rootNode => (
        <TreeNodeRow
          key={rootNode.id}
          node={rootNode}
          nodeValue={rootNode.label}
          depth={0}
          selectedLocations={selectedLocations}
          availableSet={availableSet}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
}
