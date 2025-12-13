import { fetchAllServices } from "@/sanity/lib/queries/services";
import ProgramsClient from "@/app/ui/components/program/programs-client";

const CATEGORY_TITLES: Record<string, string> = {
  in_person: "In-Person Training",
  online: "Online Coaching",
  program: "Strength Programs",
  nutrition: "Nutrition Coaching",
};

export default async function ProgramsPage() {
  const services = await fetchAllServices();

  const categories = Object.keys(CATEGORY_TITLES);

  const servicesByCategory: Record<string, any[]> = Object.fromEntries(
    categories.map((cat) => [cat, services.filter((s: any) => s.category === cat)])
  );

  return (
    <ProgramsClient
      categories={categories}
      servicesByCategory={servicesByCategory}
      categoryTitles={CATEGORY_TITLES}
    />
  );
}