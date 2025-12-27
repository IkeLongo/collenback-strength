import { draftMode } from "next/headers";
import { fetchAllServices } from "@/sanity/lib/queries/services";
import AdminProgramsWrapper from "@/app/ui/admin/programs/admin-programs-wrapper";
import { stegaClean } from "next-sanity";

const CATEGORY_TITLES: Record<string, string> = {
  in_person: "In-Person Coaching",
  online: "Online Coaching",
  program: "Strength Programs",
  nutrition: "Nutrition Coaching",
};

export default async function ProgramsPage() {
  const { isEnabled } = await draftMode();

  const services = await fetchAllServices({ preview: isEnabled });

  const categories = Object.keys(CATEGORY_TITLES);
  const servicesByCategory: Record<string, any[]> = Object.fromEntries(
    categories.map((cat) => [
      cat,
      services.filter((s: any) => stegaClean(s.category) === cat),
    ])
  );

  // console.log(
  //   services.map((s:any) => ({
  //     id: s._id,
  //     title: stegaClean(s.title),
  //     isActive: s.isActive,
  //     category: stegaClean(s.category),
  //   }))
  // );

  return (
    <AdminProgramsWrapper
      categories={categories}
      servicesByCategory={servicesByCategory}
      categoryTitles={CATEGORY_TITLES}
    />
  );
}