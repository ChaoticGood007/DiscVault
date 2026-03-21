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

export interface LocationNode {
  id: string
  label: string
  inBag: boolean
  children: LocationNode[]
}

export interface FlatLocation {
  /** Fully qualified path, e.g. "Zac's Bag / Putter Pocket" */
  path: string
  /** Raw slash-joined key matching the DB value, e.g. "Zac's Bag/Putter Pocket" */
  value: string
  /** Whether this location (or any ancestor) is marked inBag */
  inBag: boolean
  node: LocationNode
}

/**
 * Recursively flatten a tree into a list of { path, value, inBag, node }.
 * Children inherit parent's inBag=true flag.
 */
export function flattenTree(
  nodes: LocationNode[],
  parentPath = '',
  parentValue = '',
  parentInBag = false
): FlatLocation[] {
  const result: FlatLocation[] = []
  for (const node of nodes) {
    const displayPath = parentPath ? `${parentPath} / ${node.label}` : node.label
    const valuePath = parentValue ? `${parentValue}/${node.label}` : node.label
    const effectiveInBag = parentInBag || node.inBag
    result.push({ path: displayPath, value: valuePath, inBag: effectiveInBag, node })
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, displayPath, valuePath, effectiveInBag))
    }
  }
  return result
}

/**
 * Given a location string from the DB (e.g. "Zac's Bag/Putter Pocket"),
 * find whether it or any ancestor is marked inBag in the tree.
 */
export function resolveInBag(location: string | null, tree: LocationNode[]): boolean | null {
  if (!location) return null // no location = manual mode
  const flat = flattenTree(tree)
  const match = flat.find(f => f.value === location)
  return match ? match.inBag : null // null = location not found in tree = manual mode
}

/**
 * Parse existing location strings from the DB into a tree structure.
 * Used for the one-time migration helper.
 * e.g. ["Zac's Bag/Putter Pocket", "Zac's Bag/Main Pocket", "Storage/Shelf"]
 * → tree with "Zac's Bag" and "Storage" as roots, children beneath.
 */
export function buildTreeFromPaths(paths: string[]): LocationNode[] {
  const rootMap = new Map<string, LocationNode>()

  for (const raw of paths) {
    if (!raw) continue
    const parts = raw.split('/').map(p => p.trim()).filter(Boolean)
    if (parts.length === 0) continue

    const rootLabel = parts[0]
    if (!rootMap.has(rootLabel)) {
      rootMap.set(rootLabel, {
        id: crypto.randomUUID(),
        label: rootLabel,
        inBag: false,
        children: [],
      })
    }

    let current = rootMap.get(rootLabel)!
    for (let i = 1; i < parts.length; i++) {
      const childLabel = parts[i]
      let child = current.children.find(c => c.label === childLabel)
      if (!child) {
        child = {
          id: crypto.randomUUID(),
          label: childLabel,
          inBag: false,
          children: [],
        }
        current.children.push(child)
      }
      current = child
    }
  }

  return Array.from(rootMap.values())
}

/**
 * Move `draggedId` to appear immediately before `targetId` anywhere in the tree.
 * Works across parents (effectively reparents the dragged node).
 */
export function reorderInTree(
  tree: LocationNode[],
  draggedId: string,
  targetId: string
): LocationNode[] {
  if (draggedId === targetId) return tree

  // Step 1: extract the dragged node from the tree
  let dragged: LocationNode | null = null
  function extract(nodes: LocationNode[]): LocationNode[] {
    return nodes
      .filter(n => { if (n.id === draggedId) { dragged = n; return false } return true })
      .map(n => ({ ...n, children: extract(n.children) }))
  }
  const pruned = extract(tree)
  if (!dragged) return tree

  // Step 2: insert it before the target
  function insert(nodes: LocationNode[]): LocationNode[] {
    const idx = nodes.findIndex(n => n.id === targetId)
    if (idx >= 0) {
      const result = [...nodes]
      result.splice(idx, 0, dragged!)
      return result
    }
    return nodes.map(n => ({ ...n, children: insert(n.children) }))
  }
  return insert(pruned)
}
/** Find a node's parent id and its index within siblings (null parentId = root level). */
export function getNodeInfo(
  tree: LocationNode[],
  nodeId: string,
  parentId: string | null = null,
  indexInParent = 0
): { parentId: string | null; index: number; prevSiblingId: string | null } | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === nodeId) {
      return {
        parentId,
        index: i,
        prevSiblingId: i > 0 ? tree[i - 1].id : null,
      }
    }
    const found = getNodeInfo(tree[i].children, nodeId, tree[i].id, i)
    if (found) return found
  }
  return null
}

/**
 * Indent: make nodeId the last child of its previous sibling.
 * No-op if node has no previous sibling.
 */
export function indentNode(tree: LocationNode[], nodeId: string): LocationNode[] {
  const info = getNodeInfo(tree, nodeId)
  if (!info || !info.prevSiblingId) return tree

  const prevSiblingId = info.prevSiblingId   // narrow for closure
  let node: LocationNode | null = null

  function extract(nodes: LocationNode[]): LocationNode[] {
    return nodes
      .filter(n => { if (n.id === nodeId) { node = n; return false } return true })
      .map(n => ({ ...n, children: extract(n.children) }))
  }
  const pruned = extract(tree)
  if (!node) return tree

  function inject(nodes: LocationNode[]): LocationNode[] {
    return nodes.map(n => {
      if (n.id === prevSiblingId) {
        return { ...n, children: [...n.children, node!] }
      }
      return { ...n, children: inject(n.children) }
    })
  }
  return inject(pruned)
}

/**
 * Dedent: promote nodeId to be a sibling of its parent, inserted after the parent.
 * No-op if node is already at root level.
 */
export function dedentNode(tree: LocationNode[], nodeId: string): LocationNode[] {
  const info = getNodeInfo(tree, nodeId)
  if (!info || info.parentId === null) return tree // already at root

  let node: LocationNode | null = null

  // Extract node and also note the parent id so we can insert after it
  function extract(nodes: LocationNode[]): LocationNode[] {
    return nodes
      .filter(n => { if (n.id === nodeId) { node = n; return false } return true })
      .map(n => ({ ...n, children: extract(n.children) }))
  }
  const pruned = extract(tree)
  if (!node) return tree

  const parentId = info.parentId

  // Insert node immediately after its former parent
  function insertAfterParent(nodes: LocationNode[]): LocationNode[] {
    const idx = nodes.findIndex(n => n.id === parentId)
    if (idx >= 0) {
      const result = [...nodes]
      result.splice(idx + 1, 0, node!)
      return result
    }
    return nodes.map(n => ({ ...n, children: insertAfterParent(n.children) }))
  }
  return insertAfterParent(pruned)
}
