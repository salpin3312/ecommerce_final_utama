import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { addToCart } from "../service/api/cartService";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../lib/lib";

function ProductCard({ product }) {
   const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || product.size?.[0] || "");
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
         // Coba ambil pesan error dari response API, fallback ke pesan default
         const errorMsg =
            error?.response?.data?.message || error?.message || "Failed to add to cart. Please try again.";
         toast.error(errorMsg);
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
         <Link to={`/product/detail/${product.id}`} className="block">
            <figure className="px-4 pt-4 relative">
               {/* Discount Badge */}
               {product.hasActiveDiscount && (
                  <div className="absolute top-2 left-2 z-10">
                     <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
                        -{product.discountPercentage}%
                     </div>
                  </div>
               )}

               {product.imageUrl ? (
                  <img
                     src={`${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:8000"}${
                        product.imageUrl
                     }`}
                     alt={product.name}
                     className="rounded-xl object-cover w-full h-64"
                     onError={(e) => {
                        // Fallback jika gambar tidak ditemukan
                        e.target.src = `https://placehold.co/300x400?text=${product.name.charAt(0)}`;
                     }}
                  />
               ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-xl">
                     <span className="text-gray-500 text-3xl">{product.name.charAt(0)}</span>
                  </div>
               )}
            </figure>
            <div className="card-body pb-0 cursor-pointer">
               <h2 className="card-title hover:text-primary">{product.name}</h2>
               {typeof product.avgRating !== "undefined" && (
                  <div className="flex items-center gap-2">
                     <div className="rating rating-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <input
                              key={i}
                              type="radio"
                              className={`mask mask-star-2 ${
                                 i < Math.round(product.avgRating) ? "bg-orange-400" : "bg-gray-300"
                              }`}
                              readOnly
                           />
                        ))}
                     </div>
                     <span className="text-xs text-gray-500">
                        {product.avgRating?.toFixed
                           ? product.avgRating.toFixed(1)
                           : Number(product.avgRating || 0).toFixed(1)}
                        {typeof product.reviewCount !== "undefined" && ` (${product.reviewCount})`}
                     </span>
                  </div>
               )}
               {/* Price Display with Discount */}
               <div className="flex items-center gap-2 flex-wrap">
                  {product.hasActiveDiscount ? (
                     <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-green-600">
                           {formatCurrency(product.discountedPrice)}
                        </p>
                        <p className="text-sm text-gray-500 line-through">{formatCurrency(formattedPrice)}</p>
                        <span className="badge badge-error text-xs">-{product.discountPercentage}%</span>
                     </div>
                  ) : (
                     <p className="text-lg font-semibold">{formatCurrency(formattedPrice)}</p>
                  )}
               </div>

               {/* Discount Status Message */}
               {product.hasActiveDiscount && product.discountStatus && (
                  <p className="text-xs text-green-600 font-medium">{product.discountStatus.message}</p>
               )}

               <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{product.stock > 0 ? `Stok: ${product.stock}` : "Stok: Habis"}</span>
                  {product.soldCount > 0 && (
                     <span className="text-green-600 font-medium">Terjual: {product.soldCount}</span>
                  )}
               </div>
            </div>
         </Link>

         <div className="card-body pt-2">
            {hasSizes && (
               <div className="my-2">
                  <span className="text-sm mb-1 block">Size:</span>
                  <div className="flex gap-1 flex-wrap">
                     {sizesArray.map((size) => (
                        <button
                           key={size}
                           className={`btn btn-xs ${selectedSize === size ? "btn-primary" : "btn-outline"}`}
                           onClick={() => setSelectedSize(size)}>
                           {size}
                        </button>
                     ))}
                  </div>
               </div>
            )}

            <div className="card-actions justify-between items-center mt-2">
               <button className="btn btn-primary" onClick={handleAddToCart} disabled={loading}>
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

// Small Product Card for Home page
export function SmallProductCard({ product }) {
   const formattedPrice = product.price ? product.price.toLocaleString() : "0";

   return (
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
         <Link to={`/product/detail/${product.id}`} className="block">
            <figure className="px-3 pt-3 relative">
               {/* Discount Badge */}
               {product.hasActiveDiscount && (
                  <div className="absolute top-1 left-1 z-10">
                     <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-md">
                        -{product.discountPercentage}%
                     </div>
                  </div>
               )}

               {product.imageUrl ? (
                  <img
                     src={`${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://localhost:8000"}${
                        product.imageUrl
                     }`}
                     alt={product.name}
                     className="rounded-lg object-cover w-full h-40"
                     onError={(e) => {
                        e.target.src = `https://placehold.co/250x160?text=${product.name.charAt(0)}`;
                     }}
                  />
               ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg">
                     <span className="text-gray-500 text-2xl">{product.name.charAt(0)}</span>
                  </div>
               )}
            </figure>
            <div className="card-body p-3 cursor-pointer">
               <h2 className="card-title text-sm hover:text-primary line-clamp-2">{product.name}</h2>

               {/* Rating */}
               {typeof product.avgRating !== "undefined" && (
                  <div className="flex items-center gap-1">
                     <div className="rating rating-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <input
                              key={i}
                              type="radio"
                              className={`mask mask-star-2 ${
                                 i < Math.round(product.avgRating) ? "bg-orange-400" : "bg-gray-300"
                              }`}
                              readOnly
                           />
                        ))}
                     </div>
                     <span className="text-xs text-gray-500">
                        {product.avgRating?.toFixed
                           ? product.avgRating.toFixed(1)
                           : Number(product.avgRating || 0).toFixed(1)}
                     </span>
                  </div>
               )}

               {/* Price Display with Discount */}
               <div className="flex items-center gap-1 flex-wrap">
                  {product.hasActiveDiscount ? (
                     <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-green-600">
                           {formatCurrency(product.discountedPrice)}
                        </p>
                        <p className="text-xs text-gray-500 line-through">{formatCurrency(formattedPrice)}</p>
                     </div>
                  ) : (
                     <p className="text-sm font-semibold">{formatCurrency(formattedPrice)}</p>
                  )}
               </div>

               {/* Stock and Sold Info */}
               <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.stock > 0 ? `Stok: ${product.stock}` : "Stok: Habis"}</span>
                  {product.soldCount > 0 && (
                     <span className="text-green-600 font-medium">Terjual: {product.soldCount}</span>
                  )}
               </div>
            </div>
         </Link>

         <div className="card-body p-3 pt-0">
            <div className="card-actions justify-center">
               <Link to={`/product/detail/${product.id}`} className="btn btn-primary btn-sm w-full">
                  Lihat Detail
               </Link>
            </div>
         </div>
      </div>
   );
}
