/*
 * Copyright 2026 Google LLC
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

'use server'

import { db as prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addDisc(formData: FormData) {
  const moldId = formData.get('moldId') as string
  const collectionId = formData.get('collectionId') as string || null
  const weight = parseFloat(formData.get('weight') as string) || null
  const color = formData.get('color') as string
  const plastic = formData.get('plastic') as string
  const stamp = formData.get('stamp') as string
  const stampFoil = formData.get('stampFoil') as string
  const location = formData.get('location') as string
  const condition = parseInt(formData.get('condition') as string) || null
  const inBag = formData.get('inBag') === 'on'
  const ink = formData.get('ink') as string
  const notes = formData.get('notes') as string

  if (!moldId) {
    throw new Error('Mold ID is required')
  }

  await prisma.inventory.create({
    data: {
      moldId,
      collectionId,
      weight,
      color,
      plastic,
      stamp,
      stampFoil,
      location,
      condition,
      inBag,
      ink,
      notes,
    },
  })

  revalidatePath('/')
  revalidatePath('/v/all')
  if (collectionId) revalidatePath(`/v/${collectionId}`)
  redirect(collectionId ? `/v/${collectionId}` : '/v/all')
}

export async function updateDisc(id: string, formData: FormData) {
  const collectionId = formData.get('collectionId') as string || null
  const weight = parseFloat(formData.get('weight') as string) || null
  const color = formData.get('color') as string
  const plastic = formData.get('plastic') as string
  const stamp = formData.get('stamp') as string
  const stampFoil = formData.get('stampFoil') as string
  const location = formData.get('location') as string
  const condition = parseInt(formData.get('condition') as string) || null
  const inBag = formData.get('inBag') === 'on'
  const ink = formData.get('ink') as string
  const notes = formData.get('notes') as string

  await prisma.inventory.update({
    where: { id },
    data: {
      collectionId,
      weight,
      color,
      plastic,
      stamp,
      stampFoil,
      location,
      condition,
      inBag,
      ink,
      notes,
    },
  })

  revalidatePath('/')
  revalidatePath('/v/all')
  if (collectionId) revalidatePath(`/v/${collectionId}`)
  redirect(collectionId ? `/v/${collectionId}` : '/v/all')
}

export async function deleteDisc(id: string, vaultId: string) {
  await prisma.inventory.delete({
    where: { id },
  })

  revalidatePath('/')
  revalidatePath('/v/all')
  revalidatePath(`/v/${vaultId}`)
  redirect(`/v/${vaultId}`)
}

function getStability(turn: number, fade: number): string {
  const score = turn + fade
  if (score <= -2) return 'Understable'
  if (score <= 0) return 'Stable'
  if (score <= 2) return 'Overstable'
  return 'Very Overstable'
}

const BRAND_SYNONYMS: Record<string, string> = {
  'agl': 'Above Ground Level',
  'dd': 'Dynamic Discs',
  'dga': 'Disc Golf Association',
  'mvp': 'MVP',
  'mvp disc sports': 'MVP',
  'tsa': 'Thought Space Athletics',
  'thoughtspace': 'Thought Space Athletics',
  'disc mania': 'Discmania',
  'lat 64': 'Latitude 64',
  'lattitude 64': 'Latitude 64',
  'axiom': 'Axiom Discs',
  'axiom discs': 'Axiom Discs',
  'lonestar': 'Lone Star Discs',
  'lone star': 'Lone Star Discs',
  'streamline discs': 'Streamline',
  'birdie disc golf supply': 'Birdie',
  'loft': 'Løft Discs',
}

export async function importDiscs(records: any[], targetCollectionId?: string) {
  let successCount = 0
  
  for (const record of records) {
    try {
      let moldName = (record.name || '').trim()
      let moldBrand = (record.brand || '').trim()

      if (!moldName || !moldBrand) continue

      // Check for brand synonyms
      const normalizedBrand = moldBrand.toLowerCase().trim()
      if (BRAND_SYNONYMS[normalizedBrand]) {
        moldBrand = BRAND_SYNONYMS[normalizedBrand]
      }

      let mold = await prisma.mold.findFirst({
        where: {
          name: { equals: moldName },
          brand: { equals: moldBrand }
        }
      })

      if (!mold) {
        mold = await prisma.mold.findFirst({
          where: {
            name: { contains: moldName },
            brand: { contains: moldBrand }
          }
        })
      }

      if (!mold) {
        const speed = parseFloat(record.speed) || 0
        const glide = parseFloat(record.glide) || 0
        const turn = parseFloat(record.turn) || 0
        const fade = parseFloat(record.fade) || 0
        
        mold = await prisma.mold.create({
          data: {
            name: moldName,
            brand: moldBrand,
            category: record.category || 'Unknown',
            speed,
            glide,
            turn,
            fade,
            stability: record.stability || getStability(turn, fade),
            isCustom: true
          }
        })
      }

      await prisma.inventory.create({
        data: {
          moldId: mold.id,
          collectionId: targetCollectionId || null,
          plastic: record.plastic || null,
          weight: parseFloat(record.weight) || null,
          color: record.color || null,
          stamp: record.stamp || null,
          stampFoil: record.stampFoil || null,
          location: record.location || null,
          condition: parseInt(record.condition) || null,
          inBag: typeof record.inBag === 'string' 
            ? ['true', 'yes', '1', 'bag'].includes(record.inBag.toLowerCase().trim())
            : record.inBag === true,
          ink: record.ink || null,
          notes: record.notes || null,
        }
      })
      successCount++
    } catch (e) {
      console.error('Failed to import record', e)
    }
  }

  revalidatePath('/')
  revalidatePath('/v/all')
  if (targetCollectionId) revalidatePath(`/v/${targetCollectionId}`)
  return { successCount }
}

export async function exportInventory() {
  return await prisma.inventory.findMany({
    include: {
      mold: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function moveDiscsToCollection(ids: string[], targetCollectionId: string | null) {
  await prisma.inventory.updateMany({
    where: {
      id: { in: ids }
    },
    data: {
      collectionId: targetCollectionId || null
    }
  })

  revalidatePath('/')
  revalidatePath('/v/all')
  if (targetCollectionId) revalidatePath(`/v/${targetCollectionId}`)
}

export async function getPaginatedInventory(options: {
  page: number
  pageSize: number
  where: any
  orderBy: any
}) {
  const { page, pageSize, where, orderBy } = options
  return await prisma.inventory.findMany({
    where,
    include: {
      mold: true,
      collection: true,
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
}
