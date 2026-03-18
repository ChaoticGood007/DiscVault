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
import CSVImporter from "@/components/CSVImporter"

export default async function ScopedImportPage({
  params,
}: {
  params: Promise<{ vaultId: string }>
}) {
  const { vaultId } = await params
  
  const vault = await prisma.discCollection.findUnique({
    where: { id: vaultId }
  })

  if (!vault) return null

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Import to {vault.name}</h1>
        <p className="mt-3 text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Upload a CSV file and map your data. All discs will be added directly to this vault.
        </p>
      </div>
      
      <CSVImporter targetVault={vault as any} />
    </div>
  )
}
