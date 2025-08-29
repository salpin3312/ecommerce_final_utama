import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast for notifications
import ProductCard from "../components/Product-Card";
import { getAllProducts, searchProducts } from "../service/api/productService";
import axiosInstance from "../service/axiosService";

function Shop() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [reviews, setReviews] = useState([]);
   const reviewsRef = useRef(null);
   const itemRefs = useRef([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isHovered, setIsHovered] = useState(false);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            // Hanya ambil produk dengan status ACTIVE
            const data = await getAllProducts({ status: "ACTIVE" });
            setProducts(data);
            const r = await axiosInstance.get("/api/reviews/latest");
            setReviews(r.data.reviews || []);
         } catch (error) {
            setError("Failed to fetch products");
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   const scrollToIndex = (index) => {
      const container = reviewsRef.current;
      const target = itemRefs.current[index];
      if (!container || !target) return;
      container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
   };

   const scrollReviews = (direction) => {
      if (reviews.length === 0) return;
      const nextIndex =
         direction === "left"
            ? (currentIndex - 1 + reviews.length) % reviews.length
            : (currentIndex + 1) % reviews.length;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
   };

   useEffect(() => {
      if (reviews.length === 0 || isHovered) return;
      const interval = setInterval(() => {
         scrollReviews("right");
      }, 4000);
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [reviews, currentIndex, isHovered]);

   // Sync currentIndex when user scrolls manually (best-effort)
   useEffect(() => {
      const el = reviewsRef.current;
      if (!el) return;
      const onScroll = () => {
         let closestIndex = 0;
         let minDelta = Infinity;
         itemRefs.current.forEach((child, idx) => {
            if (!child) return;
            const delta = Math.abs(child.offsetLeft - el.scrollLeft);
            if (delta < minDelta) {
               minDelta = delta;
               closestIndex = idx;
            }
         });
         setCurrentIndex(closestIndex);
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => el.removeEventListener("scroll", onScroll);
   }, []);

   // Handle search
   const handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;

      try {
         setLoading(true);
         const result = await searchProducts(searchTerm);
         // Filter hasil pencarian untuk hanya menampilkan produk ACTIVE
         const activeProducts = result.products.filter((product) => product.status === "ACTIVE");
         setProducts(activeProducts);
      } catch (error) {
         toast.error("Error searching products");
         setError("Failed to search products");
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <div className="container mx-auto px-4 py-8 text-center">
            <span className="loading loading-spinner loading-lg"></span>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <h2 className="text-3xl font-bold mb-8">T-Shirt Kami</h2>

         {/* Search form */}
         <form className="mb-8 flex gap-2" onSubmit={handleSearch}>
            <input
               type="text"
               placeholder="Search products..."
               className="input input-bordered flex-grow"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
               Cari
            </button>
         </form>

         {error && (
            <div className="alert alert-error mb-4">
               <span>{error}</span>
            </div>
         )}

         {products.length === 0 && !loading ? (
            <div className="text-center py-8">
               <p>No products found</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
               ))}
            </div>
         )}

         {/* Reviews Section moved from Home */}
         <div className="py-16">
            <div className="mb-4 flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900">Ulasan Terbaru</h2>
                  <p className="text-gray-600">Apa kata mereka setelah menerima pesanan</p>
               </div>
               {reviews.length > 0 && (
                  <div className="join">
                     <button type="button" className="btn btn-sm join-item" onClick={() => scrollReviews("left")}>
                        ‹
                     </button>
                     <button type="button" className="btn btn-sm join-item" onClick={() => scrollReviews("right")}>
                        ›
                     </button>
                  </div>
               )}
            </div>
            {reviews.length === 0 ? (
               <p className="text-center text-gray-500">Belum ada ulasan.</p>
            ) : (
               <>
                  <div
                     ref={reviewsRef}
                     className="overflow-x-auto pb-2"
                     onMouseEnter={() => setIsHovered(true)}
                     onMouseLeave={() => setIsHovered(false)}>
                     <div className="flex gap-4 snap-x snap-mandatory">
                        {reviews.map((rv, i) => {
                           const productImage = rv.product?.imageUrl;
                           const productName = rv.product?.name;
                           const userName = rv.userName || "Pengguna";
                           const dateStr = rv.createdAt
                              ? new Date(rv.createdAt).toLocaleDateString("id-ID", {
                                   year: "numeric",
                                   month: "long",
                                   day: "numeric",
                                })
                              : "";
                           return (
                              <div
                                 key={rv.id}
                                 className="min-w-[20rem] snap-start"
                                 ref={(el) => (itemRefs.current[i] = el)}>
                                 <div className="card bg-base-100 shadow">
                                    <div className="card-body">
                                       <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-2">
                                             <div className="rating rating-sm">
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                   <input
                                                      key={j}
                                                      type="radio"
                                                      className={`mask mask-star-2 ${
                                                         j < rv.rating ? "bg-orange-400" : "bg-gray-300"
                                                      }`}
                                                      readOnly
                                                   />
                                                ))}
                                             </div>
                                          </div>
                                          {productImage && (
                                             <img
                                                src={`${
                                                   import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
                                                   "http://localhost:8000"
                                                }${productImage}`}
                                                alt={productName || "Produk"}
                                                className="w-10 h-10 rounded object-cover border"
                                                onError={(e) => {
                                                   e.target.src = `https://placehold.co/80x80?text=${(
                                                      productName || "P"
                                                   ).charAt(0)}`;
                                                }}
                                             />
                                          )}
                                       </div>
                                       <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                                          <span>{userName}</span>
                                          {dateStr && <span>{dateStr}</span>}
                                       </div>
                                       <p className="text-sm text-gray-700 mt-2">{rv.comment || "(tanpa komentar)"}</p>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                     {reviews.map((_, i) => (
                        <button
                           key={i}
                           aria-label={`Slide ${i + 1}`}
                           className={`btn btn-xs rounded-full ${i === currentIndex ? "btn-primary" : "btn-ghost"}`}
                           onClick={() => {
                              setCurrentIndex(i);
                              scrollToIndex(i);
                           }}>
                           {" "}
                        </button>
                     ))}
                  </div>
               </>
            )}
         </div>
      </div>
   );
}

export default Shop;
