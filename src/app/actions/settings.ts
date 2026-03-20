'use server'

import { db as prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGlobalSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: 'global' },
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'global', accentColor: '#4f46e5' },
    })
  }
  
  return settings
}

export async function updateAccentColor(hexCode: string) {
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { accentColor: hexCode },
    create: { id: 'global', accentColor: hexCode },
  })
  
  revalidatePath('/', 'layout')
}
