import { fetchAllServices } from "@/sanity/lib/queries/services";
import CheckoutClient from "@/app/ui/components/stripe/checkout-client";
import { Service } from "@/app/types/types";

export default async function CheckoutPage() {
  const services = await fetchAllServices();
  const products = services.map((service: Service) => ({
    id: service._id,
    name: service.title,
    price: service.priceCents,
    image: service.image,
    sku: service.stripePriceId,
    currency: service.currency || "usd",
  }));

  return <CheckoutClient />;
}
