import { client } from "@/sanity/lib/client";

export async function fetchAllServices() {
  return client.fetch(
    `*[_type == "service" && isActive == true]{
      _id,
      title,
      slug,
      category,
      shortDescription,
      longDescription,
      image,
      sessionsIncluded,
      priceCents,
      currency,
      stripePriceId
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
      shortDescription,
      longDescription,
      image,
      sessionsIncluded,
      priceCents,
      currency,
      stripePriceId
    }`,
    { slug }
  );
}