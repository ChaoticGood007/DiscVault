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

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

// Mapping of common CSV headers to our internal field names
const HEADER_MAP: Record<string, string> = {
  // Identity
  'disc name': 'name',
  'mold': 'name',
  'disc': 'name',
  'manufacturer': 'brand',
  'brand': 'brand',
  'make': 'brand',
  
  // Specs
  'plastic': 'plastic',
  'material': 'plastic',
  'weight': 'weight',
  'wgt': 'weight',
  'color': 'color',
  'stamp': 'stamp',
  'stamp foil': 'stampFoil',
  'foil': 'stampFoil',
  
  // Stats
  'category': 'category',
  'speed': 'speed',
  'glide': 'glide',
  'turn': 'turn',
  'fade': 'fade',
  
  // Status
  'location': 'location',
  'condition': 'condition',
  'ink': 'ink',
  'notes': 'notes',
  'comment': 'notes'
}

const BRAND_SYNONYMS: Record<string, string> = {
  'agl': 'Above Ground Level',
  'dd': 'Dynamic Discs',
  'dga': 'Disc Golf Association',
  'mvp': 'MVP Disc Sports',
  'tsa': 'Thought Space Athletics',
  'disc mania': 'Discmania',
  'lat 64': 'Latitude 64',
}

function getStability(turn: number, fade: number): string {
  const score = turn + fade
  if (score <= -2) return 'Understable'
  if (score <= 0) return 'Stable'
  if (score <= 2) return 'Overstable'
  return 'Very Overstable'
}

async function smartImport(filePath: string) {
  const absolutePath = path.resolve(filePath)
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`)
    return
  }

  const fileContent = fs.readFileSync(absolutePath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })

  if (records.length === 0) {
    console.log('No records found in CSV.')
    return
  }

  // Detect column mapping based on the first record's keys
  const csvHeaders = Object.keys(records[0] as any)
  const mapping: Record<string, string> = {}
  
  csvHeaders.forEach(header => {
    const normalized = header.toLowerCase().trim()
    if (HEADER_MAP[normalized]) {
      mapping[header] = HEADER_MAP[normalized]
    }
  })

  console.log(`Detected mapping:`, mapping)
  console.log(`Starting import of ${records.length} records...`)

  let successCount = 0
  let errorCount = 0

  for (const record of records as any[]) {
    try {
      // 1. Extract and normalize data
      const data: any = {}
      Object.entries(mapping).forEach(([csvHeader, internalField]) => {
        data[internalField] = record[csvHeader]
      })

      // 2. Resolve or Create Mold
      let moldName = (data.name || '').trim()
      let moldBrand = (data.brand || '').trim()

      if (!moldName || !moldBrand) {
        console.warn(`Skipping record: Missing name or brand.`, record)
        errorCount++
        continue
      }

      // Check for brand synonyms
      const normalizedBrand = moldBrand.toLowerCase().trim()
      if (BRAND_SYNONYMS[normalizedBrand]) {
        moldBrand = BRAND_SYNONYMS[normalizedBrand]
      }

      // Try exact match first
      let mold = await prisma.mold.findFirst({
        where: {
          name: { equals: moldName },
          brand: { equals: moldBrand }
        }
      })

      // If not found, try case-insensitive partial match or slug match
      if (!mold) {
        mold = await prisma.mold.findFirst({
          where: {
            name: { contains: moldName },
            brand: { contains: moldBrand }
          }
        })
      }

      // If STILL not found, create a custom mold using provided stats
      if (!mold) {
        const speed = parseFloat(data.speed) || 0
        const glide = parseFloat(data.glide) || 0
        const turn = parseFloat(data.turn) || 0
        const fade = parseFloat(data.fade) || 0
        
        mold = await prisma.mold.create({
          data: {
            name: moldName,
            brand: moldBrand,
            category: data.category || 'Unknown',
            speed,
            glide,
            turn,
            fade,
            stability: getStability(turn, fade),
            isCustom: true
          }
        })
        console.log(`Created custom mold: ${moldBrand} ${moldName}`)
      }

      // 3. Create Inventory Entry
      await prisma.inventory.create({
        data: {
          moldId: mold.id,
          plastic: data.plastic || null,
          weight: parseFloat(data.weight) || null,
          color: data.color || null,
          stamp: data.stamp || null,
          stampFoil: data.stampFoil || null,
          location: data.location || null,
          condition: parseInt(data.condition) || null,
          ink: data.ink || null,
          notes: data.notes || null,
        }
      })

      successCount++
    } catch (err) {
      console.error(`Error importing record:`, record, err)
      errorCount++
    }
  }

  console.log(`Import complete!`)
  console.log(`Successfully imported: ${successCount}`)
  console.log(`Errors encountered: ${errorCount}`)
}

const csvFile = process.argv[2] || 'Disc Golf Inventory DB - Disc Golf Inventory DB(1).csv'
smartImport(csvFile)
  .catch(console.error)
  .finally(() => prisma.$disconnect())
