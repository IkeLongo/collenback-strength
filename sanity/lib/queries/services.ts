import { client } from "@/sanity/lib/client";

export async function fetchAllServices() {
  const query = `
    *[_type == "service" && defined(category)]{
      _id,
      title,
      category,
      longDescription
    }
  `;
  return await client.fetch(query);
}