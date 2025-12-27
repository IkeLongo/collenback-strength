import { client } from "@/sanity/lib/client";

export async function fetchAllServices({ preview = false }: { preview?: boolean } = {}) {
  const sanity = preview
    ? client.withConfig({
        perspective: "previewDrafts",
        useCdn: false,
        token: process.env.SANITY_API_READ_TOKEN, // ✅ required to see drafts
      })
    : client.withConfig({
        perspective: "published",
        useCdn: false,
      });

  return sanity.fetch(
    `*[
      _type == "service" &&
      coalesce(isActive, true) == true
    ]{
      _id,
      _type,
      title,
      slug,
      category,
      program{ ... },
      shortDescription,
      longDescription,
      image,
      "imageUrl": image.asset->url,
      isActive,
      sessionsIncluded,
      priceCents,
      currency,
      stripePriceId,
      pricingModel,
      membership{ ... }
    }`
  );
}

export async function fetchServiceBySlug(slug: string) {
  return client.fetch(
    `*[_type == "service" && slug.current == $slug && isActive == true][0]{
      _id,
      title,
      slug,
      category,
      program {
        version,
        notes,
        pdf {
          asset->{
            _id,
            originalFilename
          }
        },
        coverImageAlt,
        "coverImageUrl": coverImage.asset->url
      },
      shortDescription,
      longDescription,
      image,
      "imageUrl": image.asset->url,
      sessionsIncluded,
      priceCents,
      currency,
      stripePriceId,
      pricingModel,
      membership {
        interval,
        intervalCount,
        autoRenew,
        durationDays,
        sessionsPerPeriod
      }
    }`,
    { slug }
  );
}

export async function fetchServiceById(id: string) {
  return client.fetch(
    `*[_type == "service" && _id == $id && isActive == true][0]{
      _id,
      title,
      slug,
      category,
      program {
        version,
        notes,
        pdf {
          asset->{
            _id,
            originalFilename
          }
        },
        coverImageAlt,
        "coverImageUrl": coverImage.asset->url
      },
      shortDescription,
      longDescription,
      image,
      "imageUrl": image.asset->url,
      sessionsIncluded,
      priceCents,
      currency,
      stripePriceId,
      pricingModel,
      membership {
        interval,
        intervalCount,
        autoRenew,
        durationDays,
        sessionsPerPeriod
      }
    }`,
    { id }
  );
}
