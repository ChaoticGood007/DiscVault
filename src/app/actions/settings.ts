'use server'

import { db as prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { type LocationNode, buildTreeFromPaths } from '@/lib/locationTree'

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

export async function getLocationTree(): Promise<LocationNode[]> {
  const settings = await prisma.settings.findUnique({ where: { id: 'global' } })
  try {
    return JSON.parse(settings?.locationTree || '[]') as LocationNode[]
  } catch {
    return []
  }
}

export async function saveLocationTree(tree: LocationNode[]) {
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { locationTree: JSON.stringify(tree) },
    create: { id: 'global', locationTree: JSON.stringify(tree) },
  })
  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}

/**
 * One-time migration helper: reads all distinct location strings from the
 * Inventory table, builds a tree from them, and saves it to Settings.
 * Existing tree is replaced.
 */
export async function migrateLocationsFromInventory() {
  const rows = await prisma.inventory.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ['location'],
  })
  const paths = rows.map((r: { location: string | null }) => r.location!).filter(Boolean)
  const tree = buildTreeFromPaths(paths)
  await saveLocationTree(tree)
  return { count: paths.length, nodes: tree.length }
}
