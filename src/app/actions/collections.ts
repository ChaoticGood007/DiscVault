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

export async function createCollection(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) throw new Error('Name is required')

  await prisma.discCollection.create({
    data: { name, description }
  })

  revalidatePath('/collections')
  revalidatePath('/')
}

export async function updateCollection(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  await prisma.discCollection.update({
    where: { id },
    data: { name, description }
  })

  revalidatePath('/collections')
  revalidatePath('/')
}

export async function deleteCollection(id: string) {
  // Clear primary tracking if the user deletes their active default vault
  const settings = await prisma.settings.findUnique({ where: { id: 'global' } })
  if (settings?.primaryVaultId === id) {
    await prisma.settings.update({ where: { id: 'global' }, data: { primaryVaultId: null } })
  }

  await prisma.discCollection.delete({
    where: { id }
  })

  revalidatePath('/collections')
  revalidatePath('/')
}
