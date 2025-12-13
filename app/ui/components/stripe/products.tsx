import { useShoppingCart, formatCurrencyString } from "use-shopping-cart";
import { Product } from "@/app/types/types";
import urlFor from "@/sanity/lib/urlFor";
import { FC } from "react";

interface ProductsProps {
  products: Product[];
}

const Products: FC<ProductsProps> = ({ products }) => {
  const { addItem, removeItem } = useShoppingCart();
  return (
    <section>
      {products.map((product) => (
        <div key={product.id}>
          <img
            src={product.image ? urlFor(product.image).width(200).url() : "/logo-stamp.png"}
            alt={product.name}
          />
          <h2>{product.name}</h2>
          <p>
            {formatCurrencyString({
              value: product.price,
              currency: "usd",
            })}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              className="border-2 border-yellow-400 px-4 py-1 rounded"
              onClick={() => addItem(product)}
            >
              Add to cart
            </button>
            <button
              className="border-2 border-yellow-400 px-4 py-1 rounded"
              onClick={() => removeItem(product.id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Products;