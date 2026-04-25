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

import { db as prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getLocationTree } from "@/app/actions/settings"
import { flattenTree } from "@/lib/locationTree"
import BagCheckList from "@/components/BagCheckList"

export const dynamic = 'force-dynamic'

export default async function BagCheckPage({
  params,
}: {
  params: Promise<{ vaultId: string }>
}) {
  const { vaultId } = await params

  const vault = await prisma.discCollection.findUnique({
    where: { id: vaultId },
  })

  if (!vault) notFound()

  // Get the location tree for this vault and find all bag locations
  const locationTree = await getLocationTree(vaultId)
  const flatLocs = flattenTree(locationTree)
  const bagLocations = flatLocs.filter(l => l.node.inBag)

  // Get ALL discs that are in ANY bag location (we'll filter client-side by selected bag)
  const bagPaths = bagLocations.map(l => l.value)

  // Build OR conditions for all bag paths (exact match + children)
  const locationConditions = bagPaths.flatMap(p => [
    { location: p },
    { location: { startsWith: p + '/' } }
  ])

  const discs = locationConditions.length > 0
    ? await prisma.inventory.findMany({
        where: {
          collectionId: vaultId,
          OR: locationConditions,
        },
        include: { mold: true },
        orderBy: [
          { mold: { category: 'asc' } },
          { mold: { speed: 'desc' } },
          { mold: { name: 'asc' } },
        ],
      })
    : []

  return (
    <div className="max-w-2xl w-full mx-auto">
      <BagCheckList
        vaultName={vault.name}
        bags={bagLocations.map(l => ({ label: l.path, value: l.value }))}
        discs={discs.map(d => ({
          id: d.id,
          moldName: d.mold.name,
          brand: d.mold.brand,
          category: d.mold.category,
          speed: d.mold.speed,
          glide: d.mold.glide,
          turn: d.mold.turn,
          fade: d.mold.fade,
          plastic: d.plastic,
          weight: d.weight,
          color: d.color,
          secondaryColor: d.secondaryColor,
          secondaryPattern: d.secondaryPattern,
          stampFoil: d.stampFoil,
          location: d.location,
        }))}
      />
    </div>
  )
}
