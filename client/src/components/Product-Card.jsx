import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { addToCart } from "../service/api/cartService";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../lib/lib";

function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || product.size?.[0] || ""
  );
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    try {
      setLoading(true);
      await addToCart(product.id, selectedSize, 1);
      toast.success("Product added to cart!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(
        "Silahkan melakukan login terlebih dahulu" ||
          "Failed to add to cart. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Determine which sizes array to use (handling both sizes and size fields)
  const sizesArray = product.sizes || product.size || [];
  const hasSizes = Array.isArray(sizesArray) && sizesArray.length > 0;

  // Format price with thousand separator
  const formattedPrice = product.price ? product.price.toLocaleString() : "0";

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-4 pt-4">
        {product.imageUrl ? (
          <img
            src={`${
              import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
              "http://localhost:8000"
            }${product.imageUrl}`}
            alt={product.name}
            className="rounded-xl object-cover w-full h-64"
            onError={(e) => {
              // Fallback jika gambar tidak ditemukan
              e.target.src = `https://placehold.co/300x400?text=${product.name.charAt(
                0
              )}`;
            }}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-xl">
            <span className="text-gray-500 text-3xl">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </figure>

      <div className="card-body">
        <Link to={`/product/detail/${product.id}`}>
          <h2 className="card-title hover:text-primary">{product.name}</h2>
        </Link>
        <p className="text-lg font-semibold">
          {formatCurrency(formattedPrice)}
        </p>

        {hasSizes && (
          <div className="my-2">
            <span className="text-sm mb-1 block">Size:</span>
            <div className="flex gap-1 flex-wrap">
              {sizesArray.map((size) => (
                <button
                  key={size}
                  className={`btn btn-xs ${
                    selectedSize === size ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card-actions justify-between items-center mt-2">
          <button className="btn btn-circle btn-outline">
            <Heart size={20} />
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
