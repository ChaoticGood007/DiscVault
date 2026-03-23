import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const globalSettings = await prisma.settings.findUnique({ where: { id: 'global' } })
  if (globalSettings && globalSettings.locationTree) {
    const tree = globalSettings.locationTree

    console.log(`Copying global tree to all collections: ${tree.substring(0, 50)}...`)
    
    const collections = await prisma.discCollection.findMany()
    for (const collection of collections) {
      await prisma.discCollection.update({
        where: { id: collection.id },
        data: { locationTree: tree }
      })
      console.log(`Updated collection: ${collection.name}`)
    }
  } else {
    console.log('No global settings or location tree found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
