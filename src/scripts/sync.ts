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

const prisma = new PrismaClient()

async function sync() {
  console.log('Fetching disc data from Discit API...')
  const response = await fetch('https://discit-api.fly.dev/disc')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch discs: ${response.statusText}`)
  }

  const discs = await response.json()
  console.log(`Fetched ${discs.length} discs. Starting sync...`)

  for (const disc of discs) {
    await prisma.mold.upsert({
      where: { id: disc.id },
      update: {
        name: disc.name,
        brand: disc.brand,
        category: disc.category,
        speed: parseFloat(disc.speed),
        glide: parseFloat(disc.glide),
        turn: parseFloat(disc.turn),
        fade: parseFloat(disc.fade),
        stability: disc.stability,
        link: disc.link,
        pic: disc.pic,
        name_slug: disc.name_slug,
        brand_slug: disc.brand_slug,
        category_slug: disc.category_slug,
        stability_slug: disc.stability_slug,
        color: disc.color,
        background_color: disc.background_color,
      },
      create: {
        id: disc.id,
        name: disc.name,
        brand: disc.brand,
        category: disc.category,
        speed: parseFloat(disc.speed),
        glide: parseFloat(disc.glide),
        turn: parseFloat(disc.turn),
        fade: parseFloat(disc.fade),
        stability: disc.stability,
        link: disc.link,
        pic: disc.pic,
        name_slug: disc.name_slug,
        brand_slug: disc.brand_slug,
        category_slug: disc.category_slug,
        stability_slug: disc.stability_slug,
        color: disc.color,
        background_color: disc.background_color,
      },
    })
  }

  console.log('Sync completed successfully!')
}

sync()
  .catch((e) => {
    console.error('Error during sync:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
