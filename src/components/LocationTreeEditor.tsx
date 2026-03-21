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

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, ChevronRight, Briefcase, GripVertical, FolderOpen } from 'lucide-react'
import { saveLocationTree } from '@/app/actions/settings'
import type { LocationNode } from '@/lib/locationTree'

interface LocationTreeEditorProps {
  initialTree: LocationNode[]
}

function generateId() {
  return crypto.randomUUID()
}

interface NodeRowProps {
  node: LocationNode
  depth: number
  onUpdate: (id: string, updates: Partial<LocationNode>) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string) => void
}

function NodeRow({ node, depth, onUpdate, onDelete, onAddChild }: NodeRowProps) {
  const [expanded, setExpanded] = useState(true)
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(node.label)

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50 group transition-colors"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <GripVertical className="w-3 h-3 text-slate-200 shrink-0" />

        {/* Expand toggle */}
        {node.children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 transition-transform duration-150" style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="w-3.5 h-3.5 shrink-0" />
        )}

        {/* Label */}
        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={e => setLabel(e.target.value)}
            onBlur={() => { onUpdate(node.id, { label }); setEditing(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { onUpdate(node.id, { label }); setEditing(false) } }}
            className="flex-1 text-sm font-bold text-slate-900 bg-white border border-indigo-200 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-indigo-100"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex-1 text-left text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors truncate"
          >
            {node.label || <span className="text-slate-300 italic">Unnamed</span>}
          </button>
        )}

        {/* In Bag toggle */}
        <button
          onClick={() => onUpdate(node.id, { inBag: !node.inBag })}
          title={node.inBag ? 'Marked as In Bag (children inherit)' : 'Mark as In Bag location'}
          className={`shrink-0 p-1 rounded-lg transition-all ${node.inBag ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500'}`}
        >
          <Briefcase className="w-3.5 h-3.5" />
        </button>

        {/* Add child */}
        <button
          onClick={() => onAddChild(node.id)}
          title="Add child location"
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Plus className="w-3 h-3" />
          Child
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(node.id)}
          title="Remove location"
          className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && node.children.map(child => (
        <NodeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  )
}

function updateNode(tree: LocationNode[], id: string, updates: Partial<LocationNode>): LocationNode[] {
  return tree.map(n => {
    if (n.id === id) return { ...n, ...updates }
    return { ...n, children: updateNode(n.children, id, updates) }
  })
}

function deleteNode(tree: LocationNode[], id: string): LocationNode[] {
  return tree
    .filter(n => n.id !== id)
    .map(n => ({ ...n, children: deleteNode(n.children, id) }))
}

function addChildNode(tree: LocationNode[], parentId: string): LocationNode[] {
  return tree.map(n => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, { id: generateId(), label: '', inBag: false, children: [] }] }
    }
    return { ...n, children: addChildNode(n.children, parentId) }
  })
}

export default function LocationTreeEditor({ initialTree }: LocationTreeEditorProps) {
  const [tree, setTree] = useState<LocationNode[]>(initialTree)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const autoSave = (newTree: LocationNode[]) => {
    setTree(newTree)
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await saveLocationTree(newTree)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  const handleUpdate = (id: string, updates: Partial<LocationNode>) => autoSave(updateNode(tree, id, updates))
  const handleDelete = (id: string) => autoSave(deleteNode(tree, id))
  const handleAddChild = (parentId: string) => autoSave(addChildNode(tree, parentId))
  const handleAddRoot = () => autoSave([...tree, { id: generateId(), label: '', inBag: false, children: [] }])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>{tree.length === 0 ? 'No locations defined' : `${tree.length} root location${tree.length !== 1 ? 's' : ''}`}</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Saving…</span>}
          {saved && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Saved</span>}
        </div>
      </div>

      {tree.length > 0 && (
        <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50">
          {tree.map(node => (
            <NodeRow
              key={node.id}
              node={node}
              depth={0}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
            />
          ))}
        </div>
      )}

      <button
        onClick={handleAddRoot}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-500 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Root Location
      </button>

      <p className="text-[10px] text-slate-400 leading-relaxed">
        Click a name to rename. <Briefcase className="w-2.5 h-2.5 inline-block text-emerald-500" /> marks a location as "in bag" — children inherit this flag automatically.
      </p>
    </div>
  )
}
