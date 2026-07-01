import Link from "next/link";
import { FolderHeart } from "lucide-react";
import type { Collection } from "@/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/colecciones/${collection.id}`}
      className="group relative flex h-28 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface-2 to-surface p-4 transition-all hover:border-primary/40 sm:h-32"
      style={
        collection.color
          ? {
              backgroundImage: `linear-gradient(135deg, ${collection.color}22, transparent)`,
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{collection.emoji || "📁"}</span>
        <FolderHeart className="size-4 text-subtle transition-colors group-hover:text-primary" />
      </div>
      <div>
        <p className="line-clamp-1 font-semibold">{collection.name}</p>
        <p className="text-xs text-muted">
          {collection._count?.recipes ?? 0} recetas
        </p>
      </div>
    </Link>
  );
}
