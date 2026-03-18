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
import CSVImporter from "@/components/CSVImporter"

export const dynamic = 'force-dynamic'

export default async function AllVaultsImportPage() {
  const collections = await prisma.discCollection.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Import</h1>
        <p className="mt-3 text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Upload a CSV file and select which vault to import into.
        </p>
      </div>
      
      <CSVImporter collections={collections as any} />
    </div>
  )
}
