import { db as prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import DiscDetailView from "@/components/DiscDetailView"
import { getCategoryColors } from "@/app/actions/settings"
import { flattenTree, type LocationNode } from "@/lib/locationTree"

export const dynamic = 'force-dynamic'

export default async function ScopedDetailPage({
  params,
}: {
  params: Promise<{ id: string, vaultId: string }>
}) {
  const { id, vaultId } = await params

  const [disc, categoryColors] = await Promise.all([
    prisma.inventory.findUnique({ 
      where: { id }, 
      include: { 
        mold: true, 
        collection: true 
      } 
    }),
    getCategoryColors()
  ])

  if (!disc) {
    notFound()
  }

  let bagPaths: string[] = []
  if (disc.collectionId) {
    const col = await prisma.discCollection.findUnique({
      where: { id: disc.collectionId },
      select: { locationTree: true }
    })
    if (col?.locationTree) {
      try {
        const tree = JSON.parse(col.locationTree) as LocationNode[]
        const flat = flattenTree(tree)
        bagPaths = flat.filter((l: any) => l.node.inBag).map((l: any) => l.value)
      } catch {}
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Disc Details</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium">Read-only overview of this specific disc's metadata.</p>
      </div>
      <DiscDetailView 
        disc={disc as any} 
        categoryColors={categoryColors} 
        vaultId={vaultId} 
        bagPaths={bagPaths}
      />
    </div>
  )
}
