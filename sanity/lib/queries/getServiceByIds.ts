// app/lib/sanity/getServicesByIds.ts
import { client } from "@/sanity/lib/client";

type SanityService = {
  _id: string;
  title: string;
  slug: string | null;
  category: string | null;
  pricingModel: "one_time" | "membership" | null;
  sessionsIncluded: number | null;
  image: any | null;
  program?: {
    version?: string | null;
    notes?: string | null;
    coverImageAlt?: string | null;

    // ✅ raw cover image
    coverImage: any | null;

    // keep URL too if you want
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
      image,
      program{
        version,
        notes,
        coverImageAlt,
        coverImage,
        "coverImageUrl": coverImage.asset->url
      }
    }
  `;

  return client.fetch(query, { ids: uniqueIds });
}
