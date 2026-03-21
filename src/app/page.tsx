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
import { getGlobalSettings } from '@/app/actions/settings'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [settings, fallbackVault] = await Promise.all([
    getGlobalSettings(),
    prisma.discCollection.findFirst({ orderBy: { createdAt: 'asc' } })
  ])

  // Instantly teleport the user precisely to their globally elected Primary Workspace
  if (settings.primaryVaultId) {
    redirect(`/v/${settings.primaryVaultId}`)
  } 
  // Fallback to the oldest generated Vault automatically
  else if (fallbackVault) {
    redirect(`/v/${fallbackVault.id}`)
  }
  
  // Natively intercept completely blank database systems to trigger the Setup Hub
  redirect('/vaults')
}
