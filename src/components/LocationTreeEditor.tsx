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

import { useState, useRef } from 'react'
import { Plus, Trash2, ChevronRight, Briefcase, GripVertical, FolderOpen, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveLocationTree } from '@/app/actions/settings'
import { reorderInTree, indentNode, dedentNode, getNodeInfo, type LocationNode } from '@/lib/locationTree'

interface LocationTreeEditorProps {
  initialTree: LocationNode[]
}

function generateId() {
  return crypto.randomUUID()
}

function countDescendants(node: LocationNode): number {
  if (!node.children) return 0
  return node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0)
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function updateNode(tree: LocationNode[], id: string, updates: Partial<LocationNode>): LocationNode[] {
  return tree.map(n => {
    if (n.id === id) return { ...n, ...updates }
    return { ...n, children: updateNode(n.children || [], id, updates) }
  })
}

function deleteNode(tree: LocationNode[], id: string): LocationNode[] {
  return tree
    .filter(n => n.id !== id)
    .map(n => ({ ...n, children: deleteNode(n.children || [], id) }))
}

function addChildNode(tree: LocationNode[], parentId: string): LocationNode[] {
  return tree.map(n => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children || []), { id: generateId(), label: '', inBag: false, children: [] }] }
    }
    return { ...n, children: addChildNode(n.children || [], parentId) }
  })
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function LocationTreeEditor({ initialTree }: LocationTreeEditorProps) {
  const [tree, setTree] = useState<LocationNode[]>(initialTree)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
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
  const handleIndent = (id: string) => autoSave(indentNode(tree, id))
  const handleDedent = (id: string) => autoSave(dedentNode(tree, id))

  // DnD handlers
  const handleDragStart = (id: string) => { setDraggedId(id); setDragOverId(null) }
  const handleDragOver = (id: string) => { if (id !== draggedId) setDragOverId(id) }
  const handleDrop = (targetId: string) => {
    if (draggedId && draggedId !== targetId) {
      autoSave(reorderInTree(tree, draggedId, targetId))
    }
    setDraggedId(null)
    setDragOverId(null)
  }
  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null) }



  // Override child rendering so we can inject drag state at all depths
  // by patching NodeRow to use a recursive renderNode instead of ConnectedNodeRow
  // (done by replacing ConnectedNodeRow usage in NodeRow with a prop)
  // Since we need state from the editor, we flatten by re-rendering with a render prop approach:
  const renderTree = (nodes: LocationNode[], depth = 0): React.ReactNode =>
    nodes.map(node => {
      const expanding = node.children.length > 0
      return (
        <div key={node.id}>
          {dragOverId === node.id && (
            <div className="h-0.5 mx-3 bg-indigo-400 rounded-full" />
          )}
          <DragNodeRow
            node={node}
            depth={depth}
            isDragging={draggedId === node.id}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onIndent={handleIndent}
            onDedent={handleDedent}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
          {renderTree(node.children, depth + 1)}
        </div>
      )
    })

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
        <div
          className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50"
          onDragOver={e => e.preventDefault()}
        >
          {renderTree(tree)}
        </div>
      )}

      <button
        onClick={handleAddRoot}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-500 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Root Location
      </button>

      <p className="text-[10px] text-slate-400 leading-relaxed mt-4">
        Drag <GripVertical className="w-2.5 h-2.5 inline-block" /> to reorder. Use ← / → to change nesting level. Click a name to rename. <Briefcase className="w-2.5 h-2.5 inline-block text-emerald-500" /> marks a location as &quot;in bag&quot; — children inherit this flag automatically.
      </p>
    </div>
  )
}

// ─── Stateless drag-aware row (used by renderTree) ───────────────────────────

interface DragNodeRowProps {
  node: LocationNode
  depth: number
  isDragging: boolean
  onUpdate: (id: string, updates: Partial<LocationNode>) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string) => void
  onIndent: (id: string) => void
  onDedent: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDrop: (id: string) => void
  onDragEnd: () => void
}

function DragNodeRow({
  node, depth, isDragging,
  onUpdate, onDelete, onAddChild, onIndent, onDedent,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: DragNodeRowProps) {
  const [editing, setEditing] = useState(node.label === '')
  const [label, setLabel] = useState(node.label)
  const [confirming, setConfirming] = useState(false)
  
  // Reset confirming state if we click away or start dragging
  const handleCancelDelete = () => setConfirming(false)

  const commitLabel = () => { onUpdate(node.id, { label }); setEditing(false) }

  return (
    <div
      draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(node.id) }}
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); onDragOver(node.id) }}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); onDrop(node.id) }}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-2 py-2 px-3 rounded-xl transition-all select-none cursor-default ${
        isDragging ? 'opacity-40 bg-slate-50' : 'hover:bg-slate-50'
      }`}
      style={{ paddingLeft: `${12 + depth * 24}px` }}
    >
      <GripVertical className="w-3 h-3 text-slate-300 shrink-0 cursor-grab active:cursor-grabbing" />
      <span className="w-3.5 h-3.5 shrink-0" />

      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={e => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={e => { if (e.key === 'Enter') commitLabel() }}
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

      <button
        onClick={e => { e.stopPropagation(); onIndent(node.id) }}
        title="Indent (make child of previous sibling)"
        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-black text-xs"
      >
        →
      </button>

      <button
        onClick={e => { e.stopPropagation(); onDedent(node.id) }}
        title="Dedent (move one level up)"
        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-black text-xs mr-1"
      >
        ←
      </button>

      <button
        onClick={e => { e.stopPropagation(); onUpdate(node.id, { inBag: !node.inBag }) }}
        title={node.inBag ? 'In Bag (children inherit)' : 'Mark as In Bag'}
        className={`shrink-0 p-1 rounded-lg transition-all ${node.inBag ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500'}`}
      >
        <Briefcase className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={e => { e.stopPropagation(); onAddChild(node.id) }}
        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 text-[10px] font-black uppercase tracking-widest transition-all"
      >
        <Plus className="w-3 h-3" />
        Child
      </button>

      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.div 
            key="confirming"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1"
          >
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(node.id)
              }}
              title="Confirm deletion"
              className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                handleCancelDelete()
              }}
              title="Cancel"
              className="p-1 rounded-md text-red-100 hover:text-red-600 hover:bg-red-200 bg-red-400 transition-colors"
            >
              <Plus className="w-3 h-3 rotate-45" />
            </button>
            <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter ml-1 whitespace-nowrap">
              Delete {(() => {
                const c = countDescendants(node);
                return `${c} item${c !== 1 ? 's' : ''}`;
              })()}?
            </span>
          </motion.div>
        ) : (
          <motion.button
            key="trash"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              const c = countDescendants(node);
              if (c > 0) {
                setConfirming(true)
              } else {
                onDelete(node.id)
              }
            }}
            title={countDescendants(node) > 0 ? `Delete ${node.label} and all children` : 'Remove location'}
            className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
