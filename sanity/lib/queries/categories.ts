import { client } from "@/sanity/lib/client";

export async function fetchServiceCategories() {
  const query = `array::unique(*[_type == "service" && defined(category)].category)`;
  return await client.fetch(query);
}