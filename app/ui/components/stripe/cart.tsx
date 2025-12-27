import { ReactNode } from "react";
import { CartProvider } from "use-shopping-cart";
import getStripe from "@/app/lib/stripe/getStripe";

type CartProps = {
  children: ReactNode;
};

export default function Cart({ children }: CartProps) {
  return (
    <CartProvider mode="checkout-session" stripe={getStripe()} currency="usd">
      {children}
    </CartProvider>
  );
}