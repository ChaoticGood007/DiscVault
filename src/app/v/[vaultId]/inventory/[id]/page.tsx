import { db as prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import DiscDetailView from "@/components/DiscDetailView"
import { getCategoryColors } from "@/app/actions/settings"

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Disc Details</h1>
        <p className="mt-2 text-lg text-slate-600 font-medium">Read-only overview of this specific disc's metadata.</p>
      </div>
      <DiscDetailView disc={disc as any} categoryColors={categoryColors} vaultId={vaultId} />
    </div>
  )
}
