// Category options as defined in the service schema
const CATEGORY_OPTIONS = [
  { value: "in_person", title: "In-Person Coaching" },
  { value: "online", title: "Online Coaching" },
  { value: "program", title: "Strength Program" },
  { value: "nutrition", title: "Nutrition Coaching" },
];

// Fetches all category options (value and title)
export async function fetchServiceCategories() {
  return CATEGORY_OPTIONS;
}