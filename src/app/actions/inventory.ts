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

'use server'

import { db as prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { resolveInBag } from "@/lib/locationTree"
import { getLocationTree } from "@/app/actions/settings"

function parseUserFlight(val: FormDataEntryValue | null): number | null {
  if (val === null || val === '') return null
  const n = parseFloat(val as string)
  return isNaN(n) ? null : n
}

/** Parse a float from a CSV value, returning a fallback if empty/invalid. */
function parseSafeFloat(val: any, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback
  const n = parseFloat(val)
  return isNaN(n) ? fallback : n
}

export async function addDisc(formData: FormData) {
  const moldId = formData.get('moldId') as string
  const collectionId = formData.get('collectionId') as string || null
  const weight = parseFloat(formData.get('weight') as string) || null
  const color = formData.get('color') as string
  const secondaryColor = formData.get('secondaryColor') as string || null
  const secondaryPattern = formData.get('secondaryPattern') as string || null
  const plastic = formData.get('plastic') as string
  const stamp = formData.get('stamp') as string
  const stampFoil = formData.get('stampFoil') as string
  const location = (formData.get('location') as string) || null
  const condition = parseInt(formData.get('condition') as string) || null
  const ink = formData.get('ink') as string
  const notes = formData.get('notes') as string
  const userGlide = parseUserFlight(formData.get('userGlide'))
  const userTurn = parseUserFlight(formData.get('userTurn'))
  const userFade = parseUserFlight(formData.get('userFade'))

  if (!moldId) throw new Error('Mold ID is required')

  try {
    await prisma.inventory.create({
      data: { 
        mold: { connect: { id: moldId } },
        collection: collectionId ? { connect: { id: collectionId } } : undefined,
        weight, 
        color, 
        secondaryColor, 
        secondaryPattern, 
        plastic, 
        stamp, 
        stampFoil, 
        location, 
        condition, 
        ink, 
        notes, 
        userGlide, 
        userTurn, 
        userFade 
      },
    })
  } catch (error) {
    console.error('SERVER ACTION ERROR (addDisc):', error)
    throw error
  }

  revalidatePath('/')
  revalidatePath('/v/all')
  if (collectionId) revalidatePath(`/v/${collectionId}`)
  redirect(collectionId ? `/v/${collectionId}` : '/v/all')
}

export async function updateDisc(id: string, formData: FormData) {
  const collectionId = formData.get('collectionId') as string || null
  const weight = parseFloat(formData.get('weight') as string) || null
  const color = formData.get('color') as string
  const secondaryColor = formData.get('secondaryColor') as string || null
  const secondaryPattern = formData.get('secondaryPattern') as string || null
  const plastic = formData.get('plastic') as string
  const stamp = formData.get('stamp') as string
  const stampFoil = formData.get('stampFoil') as string
  const location = (formData.get('location') as string) || null
  const condition = parseInt(formData.get('condition') as string) || null
  const ink = formData.get('ink') as string
  const notes = formData.get('notes') as string
  const userGlide = parseUserFlight(formData.get('userGlide'))
  const userTurn = parseUserFlight(formData.get('userTurn'))
  const userFade = parseUserFlight(formData.get('userFade'))

  try {
    await prisma.inventory.update({
      where: { id },
      data: { 
        collection: collectionId ? { connect: { id: collectionId } } : { disconnect: true },
        weight, 
        color, 
        secondaryColor, 
        secondaryPattern, 
        plastic, 
        stamp, 
        stampFoil, 
        location, 
        condition, 
        ink, 
        notes, 
        userGlide, 
        userTurn, 
        userFade 
      },
    })
  } catch (error) {
    console.error('SERVER ACTION ERROR (updateDisc):', error)
    throw error
  }

  revalidatePath('/')
  revalidatePath('/v/all')
  if (collectionId) revalidatePath(`/v/${collectionId}`)
}

export async function deleteDisc(id: string, vaultId: string) {
  await prisma.inventory.delete({
    where: { id },
  })

  revalidatePath('/')
  revalidatePath('/v/all')
  revalidatePath(`/v/${vaultId}`)
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
  'dynamic': 'Dynamic Discs',
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
  'innova': 'Innova',
  'innovadiscs': 'Innova',
  'discraft': 'Discraft',
  'clash': 'Clash Discs',
}

const CATEGORY_SYNONYMS: Record<string, string> = {
  'fairway': 'Control Driver',
  'fairway driver': 'Control Driver',
  'driver': 'Distance Driver',
  'utility': 'Approach Discs',
  'putt and approach': 'Putter',
}

export async function importDiscs(records: any[], targetCollectionId?: string) {
  let successCount = 0
  const tree = await getLocationTree(targetCollectionId)
  
  for (const record of records) {
    try {
      let moldName = (record.name || '').trim()
      let moldBrand = (record.brand || '').trim()

      if (!moldName || !moldBrand) continue

      const normalizedBrand = moldBrand.toLowerCase().trim()
      if (BRAND_SYNONYMS[normalizedBrand]) {
        moldBrand = BRAND_SYNONYMS[normalizedBrand]
      }

      let mold = await prisma.mold.findFirst({
        where: { name: { equals: moldName }, brand: { equals: moldBrand } }
      })

      if (!mold) {
        mold = await prisma.mold.findFirst({
          where: { name: { contains: moldName }, brand: { contains: moldBrand } }
        })
      }

      if (!mold) {
        let category = (record.category || 'Unknown').trim()
        const normalizedCategory = category.toLowerCase()
        if (CATEGORY_SYNONYMS[normalizedCategory]) {
          category = CATEGORY_SYNONYMS[normalizedCategory]
        }

        const speed = parseSafeFloat(record.speed)
        const glide = parseSafeFloat(record.glide)
        const turn = parseSafeFloat(record.turn)
        const fade = parseSafeFloat(record.fade)
        mold = await prisma.mold.create({
          data: {
            name: moldName, brand: moldBrand,
            category,
            speed, glide, turn, fade,
            stability: record.stability || getStability(turn, fade),
            isCustom: true
          }
        })
      }

      const location = record.location || null

      await prisma.inventory.create({
        data: {
          mold: { connect: { id: mold.id } },
          collection: targetCollectionId ? { connect: { id: targetCollectionId } } : undefined,
          plastic: record.plastic || null,
          weight: parseSafeFloat(record.weight, NaN) || null,
          color: record.color || null,
          secondaryColor: record.secondaryColor || null,
          secondaryPattern: record.secondaryPattern || null,
          stamp: record.stamp || null,
          stampFoil: record.stampFoil || null,
          location,
          condition: parseInt(record.condition) || null,
          ink: record.ink || null,
          notes: record.notes || null,
          userGlide: parseUserFlight(record.userGlide ?? null),
          userTurn: parseUserFlight(record.userTurn ?? null),
          userFade: parseUserFlight(record.userFade ?? null),
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
      mold: true,
      collection: true,
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

export async function bulkUpdateInventory(ids: string[], updates: Record<string, any>) {
  if (ids.length === 0 || Object.keys(updates).length === 0) return

  await prisma.inventory.updateMany({
    where: {
      id: { in: ids }
    },
    data: updates
  })

  revalidatePath('/')
  revalidatePath('/v/all')
}

export async function normalizeDatabaseMolds() {
  const molds = await prisma.mold.findMany()
  let updatedCount = 0

  for (const mold of molds) {
    let changed = false
    let newCategory = mold.category
    let newBrand = mold.brand

    const normCat = newCategory.toLowerCase().trim()
    if (CATEGORY_SYNONYMS[normCat] && CATEGORY_SYNONYMS[normCat] !== mold.category) {
      newCategory = CATEGORY_SYNONYMS[normCat]
      changed = true
    }

    const normBrand = newBrand.toLowerCase().trim()
    if (BRAND_SYNONYMS[normBrand] && BRAND_SYNONYMS[normBrand] !== mold.brand) {
      newBrand = BRAND_SYNONYMS[normBrand]
      changed = true
    }

    if (changed) {
      await prisma.mold.update({
        where: { id: mold.id },
        data: { category: newCategory, brand: newBrand }
      })
      updatedCount++
    }
  }

  revalidatePath('/settings')
  revalidatePath('/')
  revalidatePath('/v/all')
  return { updatedCount }
}
