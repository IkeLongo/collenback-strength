import { client } from "@/sanity/lib/client";

export async function fetchAllServices() {
  return client.fetch(
    `*[_type == "service" && isActive == true]{
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
