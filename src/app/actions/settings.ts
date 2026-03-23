'use server'

import { db as prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { type LocationNode, buildTreeFromPaths } from '@/lib/locationTree'
import { DEFAULT_CATEGORY_COLORS } from '@/lib/constants'

export async function getGlobalSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: 'global' },
  })

  if (!settings) {
    try {
      settings = await prisma.settings.create({
        data: { id: 'global', accentColor: '#4f46e5' },
      })
    } catch (e) {
      settings = await prisma.settings.findUnique({
        where: { id: 'global' },
      })
    }
  }
  
  return settings!
}

export async function updateAccentColor(hexCode: string) {
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { accentColor: hexCode },
    create: { id: 'global', accentColor: hexCode },
  })
  
  revalidatePath('/', 'layout')
}

export async function setPrimaryVault(vaultId: string) {
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { primaryVaultId: vaultId },
    create: { id: 'global', primaryVaultId: vaultId },
  })
  
  revalidatePath('/', 'layout')
}

export async function getLocationTree(vaultId?: string | null): Promise<LocationNode[]> {
  if (!vaultId || vaultId === 'all') return []
  const vault = await prisma.discCollection.findUnique({ where: { id: vaultId } })
  try {
    return JSON.parse(vault?.locationTree || '[]') as LocationNode[]
  } catch {
    return []
  }
}

export async function saveLocationTree(vaultId: string, tree: LocationNode[]) {
  if (!vaultId || vaultId === 'all') return
  await prisma.discCollection.update({
    where: { id: vaultId },
    data: { locationTree: JSON.stringify(tree) }
  })
  revalidatePath(`/v/${vaultId}`)
  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}

export async function getCategoryColors(): Promise<Record<string, string>> {
  const settings = await prisma.settings.findUnique({ where: { id: 'global' } })
  
  const savedColors = (() => {
    try {
      return JSON.parse(settings?.categoryColors || '{}') as Record<string, string>
    } catch {
      return {}
    }
  })();

  return { ...DEFAULT_CATEGORY_COLORS, ...savedColors }
}

export async function saveCategoryColors(colors: Record<string, string>) {
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { categoryColors: JSON.stringify(colors) },
    create: { id: 'global', categoryColors: JSON.stringify(colors) },
  })
  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}

/**
 * One-time migration helper: reads all distinct location strings from the
 * Inventory table, builds a tree from them, and saves it to Settings.
 * Existing tree is replaced.
 */
export async function migrateLocationsFromInventory(vaultId: string) {
  const rows = await prisma.inventory.findMany({
    where: { location: { not: null }, collectionId: vaultId },
    select: { location: true },
    distinct: ['location'],
  })
  const paths = rows.map((r: { location: string | null }) => r.location!).filter(Boolean)
  const tree = buildTreeFromPaths(paths)
  await saveLocationTree(vaultId, tree)
  return { count: paths.length, nodes: tree.length }
}
