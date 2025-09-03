import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast for notifications
import ProductCard from "../components/Product-Card";
import { getAllProducts, searchProducts } from "../service/api/productService";
import axiosInstance from "../service/axiosService";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Shop() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [showDiscountOnly, setShowDiscountOnly] = useState(false);
   const [reviews, setReviews] = useState([]);
   const reviewsRef = useRef(null);
   const itemRefs = useRef([]);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isHovered, setIsHovered] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [productsPerPage] = useState(12); // Jumlah produk per halaman

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

   // Reset pagination saat filter berubah
   useEffect(() => {
      setCurrentPage(1);
   }, [showDiscountOnly]);

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
         setCurrentPage(1); // Reset ke halaman pertama saat search
      } catch (error) {
         toast.error("Error searching products");
         setError("Failed to search products");
      } finally {
         setLoading(false);
      }
   };

   // Hitung produk untuk halaman saat ini
   const filteredProducts = showDiscountOnly ? products.filter((product) => product.hasActiveDiscount) : products;

   // Urutkan produk berdasarkan prioritas: diskon -> terjual terbanyak -> lainnya
   const sortedProducts = [...filteredProducts].sort((a, b) => {
      // 1. Prioritas pertama: produk dengan diskon
      const aHasDiscount = a.hasActiveDiscount || false;
      const bHasDiscount = b.hasActiveDiscount || false;

      if (aHasDiscount && !bHasDiscount) return -1;
      if (!aHasDiscount && bHasDiscount) return 1;

      // 2. Prioritas kedua: jumlah terjual (descending)
      const aSoldCount = a.soldCount || 0;
      const bSoldCount = b.soldCount || 0;

      if (aSoldCount !== bSoldCount) {
         return bSoldCount - aSoldCount; // Terjual terbanyak di atas
      }

      // 3. Jika sama, urutkan berdasarkan nama (ascending)
      return (a.name || "").localeCompare(b.name || "");
   });

   const indexOfLastProduct = currentPage * productsPerPage;
   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
   const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
   const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

   // Fungsi untuk halaman berikutnya
   const nextPage = () => {
      if (currentPage < totalPages) {
         setCurrentPage(currentPage + 1);
      }
   };

   // Fungsi untuk halaman sebelumnya
   const prevPage = () => {
      if (currentPage > 1) {
         setCurrentPage(currentPage - 1);
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
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">T-Shirt Kami</h2>
            {(() => {
               const discountProducts = products.filter((product) => product.hasActiveDiscount);
               if (discountProducts.length > 0) {
                  return (
                     <span className="badge badge-error text-lg px-4 py-2">
                        🔥 {discountProducts.length} produk diskon
                     </span>
                  );
               }
               return null;
            })()}
         </div>

         {/* Search and Filter form */}
         <div className="mb-8 space-y-4">
            <form className="flex gap-2" onSubmit={handleSearch}>
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

            {/* Filter Options */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <input
                     type="checkbox"
                     id="showDiscountOnly"
                     checked={showDiscountOnly}
                     onChange={(e) => setShowDiscountOnly(e.target.checked)}
                     className="checkbox checkbox-primary"
                  />
                  <label htmlFor="showDiscountOnly" className="text-sm font-medium">
                     Tampilkan produk diskon saja
                  </label>
               </div>

               {showDiscountOnly && (
                  <span className="badge badge-primary">
                     {products.filter((p) => p.hasActiveDiscount).length} produk diskon
                  </span>
               )}
            </div>
         </div>

         {error && (
            <div className="alert alert-error mb-4">
               <span>{error}</span>
            </div>
         )}

         {(() => {
            if (sortedProducts.length === 0 && !loading) {
               return (
                  <div className="text-center py-8">
                     <p>{showDiscountOnly ? "Tidak ada produk diskon yang ditemukan" : "No products found"}</p>
                  </div>
               );
            }

            return (
               <div>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                     ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                     <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                           onClick={prevPage}
                           disabled={currentPage === 1}
                           className="btn btn-outline btn-sm flex items-center gap-2">
                           <ChevronLeft size={16} />
                           Sebelumnya
                        </button>

                        <div className="flex items-center gap-2">
                           <span className="text-sm text-gray-600">
                              Halaman {currentPage} dari {totalPages}
                           </span>
                        </div>

                        <button
                           onClick={nextPage}
                           disabled={currentPage === totalPages}
                           className="btn btn-outline btn-sm flex items-center gap-2">
                           Selanjutnya
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  )}

                  {/* Info jumlah produk */}
                  <div className="text-center mt-4">
                     <p className="text-sm text-gray-600">
                        Menampilkan {currentProducts.length} dari {sortedProducts.length} produk
                     </p>
                  </div>
               </div>
            );
         })()}

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
