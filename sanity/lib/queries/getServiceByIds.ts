// app/lib/sanity/getServicesByIds.ts
import { client } from "@/sanity/lib/client";

type SanityService = {
  _id: string;
  title: string;
  slug: string | null;
  category: string | null;
  pricingModel: "one_time" | "membership" | null;
  sessionsIncluded: number | null;

  program?: {
    version?: string | null;
    notes?: string | null;
    coverImageAlt?: string | null;
    coverImageUrl?: string | null;
  } | null;
};

export async function getServicesByIds(ids: string[]): Promise<SanityService[]> {
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
  if (uniqueIds.length === 0) return [];

  const query = `
    *[_type == "service" && _id in $ids]{
      _id,
      title,
      "slug": slug.current,
      category,
      pricingModel,
      sessionsIncluded,
      program{
        version,
        notes,
        coverImageAlt,
        "coverImageUrl": coverImage.asset->url
      }
    }
  `;

  return client.fetch(query, { ids: uniqueIds });
}
