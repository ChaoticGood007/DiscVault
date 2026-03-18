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

import { db as prisma } from "@/lib/prisma"
import EditDiscForm from "@/components/EditDiscForm"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ScopedEditPage({
  params,
}: {
  params: Promise<{ id: string, vaultId: string }>
}) {
  const { id, vaultId } = await params

  const disc = await prisma.inventory.findUnique({
    where: { id },
    include: { mold: true },
  })

  const collections = await prisma.discCollection.findMany({
    orderBy: { name: 'asc' }
  })

  if (!disc) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Disc</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium">Update the details of this specific disc in your vault.</p>
      </div>
      <EditDiscForm disc={disc as any} collections={collections as any} />
    </div>
  )
}
