"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
   Truck,
   Phone,
   RefreshCcw,
   ShoppingCart,
   Star,
   Users,
   Award,
   Heart,
   Zap,
   Shield,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";
import { SmallProductCard } from "../components/Product-Card";
import { getFeaturedProducts } from "../service/api/productService";
import logoScreamble from "../assets/logoscreamble.png";

function Home() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedPeriod, setSelectedPeriod] = useState("month");
   const [currentPage, setCurrentPage] = useState(1);
   const [productsPerPage] = useState(12); // Jumlah produk per halaman

   useEffect(() => {
      const fetchFeaturedProducts = async () => {
         try {
            setLoading(true);
            const data = await getFeaturedProducts(selectedPeriod);
            console.log(data);
            setProducts(data.products || []);
            setCurrentPage(1); // Reset ke halaman pertama saat periode berubah
         } catch (error) {
            setError("Gagal mengambil produk unggulan");
         } finally {
            setLoading(false);
         }
      };

      fetchFeaturedProducts();
   }, [selectedPeriod]);

   // Hitung produk untuk halaman saat ini
   const indexOfLastProduct = currentPage * productsPerPage;
   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
   const totalPages = Math.ceil(products.length / productsPerPage);

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

   return (
      <div className="min-h-screen bg-gradient-to-r from-zinc-200 to-orange-100 pb-10">
         {/* Enhanced Hero Section */}
         <div className="hero bg-base-200 min-h-screen relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
               <div
                  className="absolute inset-0"
                  style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f97316' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
               />
            </div>

            <div className="hero-content flex-col lg:flex-row-reverse relative z-10">
               {/* Right Side - Enhanced Visual */}
               <div className="w-full lg:w-1/2 ms-0 lg:ms-14 relative">
                  <div className="relative transform hover:scale-105 transition-transform duration-300">
                     <img
                        src={logoScreamble}
                        alt="Screamble Logo"
                        className="w-full h-auto object-contain opacity-80 mix-blend-multiply"
                     />
                  </div>

                  {/* Background Decorations */}
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-orange-200 rounded-full opacity-50 animate-ping"></div>
                  <div
                     className="absolute -bottom-8 -right-8 w-12 h-12 bg-red-200 rounded-full opacity-50 animate-ping"
                     style={{ animationDelay: "1s" }}></div>
               </div>

               {/* Left Side - Enhanced Content */}
               <div className="w-full lg:w-1/2 space-y-6">
                  {/* Trust Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                     <div className="flex items-center space-x-2 bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-sm font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Terpercaya sejak 2022</span>
                     </div>
                  </div>

                  {/* Main Heading */}
                  <div className="space-y-4">
                     <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                        Selamat Datang di{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 animate-pulse">
                           Screamble
                        </span>
                     </h1>
                     <p className="text-xl lg:text-2xl text-gray-600 font-medium">
                        Destinasi Fashion Kaos Terdepan di Indonesia
                     </p>
                  </div>

                  {/* Enhanced Description */}
                  <div className="space-y-4 text-gray-700">
                     <p className="text-lg leading-relaxed">
                        Temukan koleksi kaos premium dengan desain eksklusif yang mengekspresikan kepribadian unik Anda.
                        Dari gaya kasual hingga streetwear modern, kami menyediakan berbagai pilihan yang sempurna untuk
                        setiap momen.
                     </p>
                     <p className="text-base leading-relaxed">
                        Dibuat dengan bahan berkualitas tinggi dan proses produksi yang teliti, setiap kaos Screamble
                        dirancang untuk memberikan kenyamanan maksimal dan daya tahan yang luar biasa.
                     </p>
                  </div>

                  {/* Product Features */}
                  <div className="grid grid-cols-2 gap-3 py-4">
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>100% Katun Premium</span>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Desain Original</span>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Sablon Berkualitas Tinggi</span>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span>Ukuran Lengkap S-XXL</span>
                     </div>
                  </div>

                  {/* Enhanced CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                     <Link
                        to="/shop"
                        className="btn btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Jelajahi Koleksi Kami
                     </Link>
                     <Link
                        to="/about"
                        className="btn btn-outline border-zinc-300 text-zinc-700 hover:bg-zinc-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                        <Heart className="mr-2 h-4 w-4" />
                        Tentang Screamble
                     </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center gap-6 pt-4">
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span>Garansi Kualitas</span>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span>Pengiriman Cepat</span>
                     </div>
                     <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Pembayaran Aman</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
               <div className="w-6 h-10 border-2 border-zinc-400 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-zinc-400 rounded-full mt-2 animate-pulse"></div>
               </div>
            </div>
         </div>

         {/* Enhanced Features Section */}
         <div className="py-20 bg-white">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Mengapa Memilih Screamble?</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                     Kami berkomitmen memberikan pengalaman berbelanja terbaik dengan produk berkualitas tinggi dan
                     layanan yang memuaskan
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group card bg-gradient-to-r from-zinc-300 to-orange-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                     <div className="card-body items-center text-center">
                        <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                           <Truck className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="card-title text-2xl mb-4">Pengiriman Super Cepat</h3>
                        <p className="text-gray-700 mb-4">
                           Kami memahami pentingnya waktu Anda. Dengan layanan pengiriman cepat kami, pesanan Anda akan
                           sampai dalam waktu singkat ke seluruh Indonesia.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                           <li>• Estimasi pengiriman hanya 1–3 hari kerja</li>
                           <li>• Dilengkapi dengan fitur pelacakan real-time</li>
                           <li>• Pengemasan profesional untuk keamanan maksimal</li>
                        </ul>
                     </div>
                  </div>

                  <div className="group card bg-gradient-to-r from-zinc-300 to-orange-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                     <div className="card-body items-center text-center">
                        <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                           <Phone className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="card-title text-2xl mb-4">Dukungan 24/7</h3>
                        <p className="text-gray-700 mb-4">
                           Tim customer service kami siap membantu Anda kapan saja. Hubungi kami melalui WhatsApp,
                           Instagram, atau Email untuk mendapatkan bantuan cepat dan responsif.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                           <li>• Respon dalam 5 menit</li>
                           <li>• Tim profesional & ramah</li>
                           <li>• Solusi cepat & tepat</li>
                        </ul>
                     </div>
                  </div>

                  <div className="group card bg-gradient-to-r from-zinc-300 to-orange-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                     <div className="card-body items-center text-center">
                        <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                           <RefreshCcw className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="card-title text-2xl mb-4">Garansi & Retur</h3>
                        <p className="text-gray-700 mb-4">
                           Tidak puas dengan pembelian Anda? Kami menawarkan kebijakan pengembalian 30 hari tanpa ribet.
                           Kualitas produk dijamin atau uang kembali 100%.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                           <li>• Retur mudah & cepat</li>
                           <li>• Refund dalam 3-5 hari</li>
                           <li>• Garansi kualitas produk</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Bagian Produk Unggulan */}
         <div className="py-16 bg-base-200">
            <div className="container mx-auto px-4">
               <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Produk Unggulan</h2>
                  <p className="text-xl text-gray-600">Koleksi terpopuler berdasarkan penjualan</p>

                  {/* Filter Periode */}
                  <div className="flex justify-center mt-6 mb-4">
                     <div className="join">
                        <button
                           className={`btn join-item ${selectedPeriod === "today" ? "btn-primary" : "btn-outline"}`}
                           onClick={() => setSelectedPeriod("today")}>
                           Hari Ini
                        </button>
                        <button
                           className={`btn join-item ${selectedPeriod === "week" ? "btn-primary" : "btn-outline"}`}
                           onClick={() => setSelectedPeriod("week")}>
                           Minggu Ini
                        </button>
                        <button
                           className={`btn join-item ${selectedPeriod === "month" ? "btn-primary" : "btn-outline"}`}
                           onClick={() => setSelectedPeriod("month")}>
                           Bulan Ini
                        </button>
                        <button
                           className={`btn join-item ${selectedPeriod === "year" ? "btn-primary" : "btn-outline"}`}
                           onClick={() => setSelectedPeriod("year")}>
                           Tahun Ini
                        </button>
                     </div>
                  </div>

                  {/* Info Periode */}
                  <div className="text-sm text-gray-600 mb-4">
                     {selectedPeriod === "today" && "Menampilkan produk terlaris hari ini"}
                     {selectedPeriod === "week" && "Menampilkan produk terlaris minggu ini"}
                     {selectedPeriod === "month" && "Menampilkan produk terlaris bulan ini"}
                     {selectedPeriod === "year" && "Menampilkan produk terlaris tahun ini"}
                  </div>
               </div>
               {loading ? (
                  <div className="text-center">
                     <div className="loading loading-spinner loading-lg text-orange-500"></div>
                     <p className="mt-4 text-gray-600">Memuat produk unggulan untuk Anda...</p>
                  </div>
               ) : error ? (
                  <div className="text-center">
                     <p className="text-red-500 text-lg">{error}</p>
                     <button onClick={() => window.location.reload()} className="btn btn-outline btn-error mt-4">
                        Coba Lagi
                     </button>
                  </div>
               ) : products.length === 0 ? (
                  <div className="text-center">
                     <div className="bg-white rounded-lg p-8 shadow-lg">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Produk Unggulan</h3>
                        <p className="text-gray-600 mb-4">
                           Belum ada produk yang terjual dalam periode{" "}
                           {selectedPeriod === "today"
                              ? "hari ini"
                              : selectedPeriod === "week"
                              ? "minggu ini"
                              : selectedPeriod === "month"
                              ? "bulan ini"
                              : "tahun ini"}
                        </p>
                        <Link to="/shop" className="btn btn-primary">
                           Jelajahi Semua Produk
                        </Link>
                     </div>
                  </div>
               ) : (
                  <div>
                     {/* Container dengan scroll horizontal */}
                     <div className="overflow-x-auto">
                        <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
                           {currentProducts.map((product) => (
                              <div
                                 key={product.id}
                                 className="transform hover:scale-105 transition-transform duration-300"
                                 style={{ minWidth: "200px", maxWidth: "200px" }}>
                                 <SmallProductCard product={product} />
                              </div>
                           ))}
                        </div>
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
                  </div>
               )}
            </div>
         </div>

         {/* Enhanced FAQ Section */}
         <div id="faq" className="py-16 bg-white">
            <div className="container mx-auto px-4">
               <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
                  <p className="text-xl text-gray-600">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
               </div>

               <div className="w-full max-w-4xl mx-auto space-y-4">
                  <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300 shadow-md hover:shadow-lg transition-all duration-300">
                     <input type="radio" name="my-accordion-2" defaultChecked />
                     <div className="collapse-title font-semibold text-lg text-gray-900">
                        Bagaimana cara membuat akun di Screamble?
                     </div>
                     <div className="collapse-content text-gray-700 leading-relaxed">
                        <p>
                           Klik tombol "Daftar" di pojok kanan atas halaman, kemudian isi formulir pendaftaran dengan
                           data yang valid. Anda akan menerima email konfirmasi untuk mengaktifkan akun. Proses
                           pendaftaran hanya membutuhkan waktu 2 menit!
                        </p>
                     </div>
                  </div>

                  <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300 shadow-md hover:shadow-lg transition-all duration-300">
                     <input type="radio" name="my-accordion-2" />
                     <div className="collapse-title font-semibold text-lg text-gray-900">
                        Saya lupa kata sandi. Apa yang harus saya lakukan?
                     </div>
                     <div className="collapse-content text-gray-700 leading-relaxed">
                        <p>
                           Anda bisa langsung klik pada profile di ujung kanan atas, lalu pilih "Profile" lalu scroll
                           kebawah pada bagian "Keamanan Akun" untuk mengubah password atau Anda bisa memberikan pesan
                           ke customer service melalui Whatsapp, Instagram, atau Email yang sudah tertera di halaman
                           "Tentang Kami"
                        </p>
                     </div>
                  </div>

                  <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300 shadow-md hover:shadow-lg transition-all duration-300">
                     <input type="radio" name="my-accordion-2" />
                     <div className="collapse-title font-semibold text-lg text-gray-900">
                        Bagaimana cara memperbarui informasi profil saya?
                     </div>
                     <div className="collapse-content text-gray-700 leading-relaxed">
                        <p>
                           Masuk ke akun Anda, buka menu profile di ujung kanan atas, kemudian pilih "Profile". Anda
                           dapat mengubah nama, alamat, nomor telepon, dan informasi lainnya seperti password. Jangan
                           lupa klik "Simpan" setelah selesai.
                        </p>
                     </div>
                  </div>

                  <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300 shadow-md hover:shadow-lg transition-all duration-300">
                     <input type="radio" name="my-accordion-2" />
                     <div className="collapse-title font-semibold text-lg text-gray-900">
                        Apakah produk Screamble tersedia dalam berbagai ukuran?
                     </div>
                     <div className="collapse-content text-gray-700 leading-relaxed">
                        <p>
                           Ya! Semua produk kaos Screamble tersedia dalam ukuran S, M, L, XL, dan XXL. Kami juga
                           menyediakan size chart detail di setiap halaman produk untuk membantu Anda memilih ukuran
                           yang tepat.
                        </p>
                     </div>
                  </div>

                  <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300 shadow-md hover:shadow-lg transition-all duration-300">
                     <input type="radio" name="my-accordion-2" />
                     <div className="collapse-title font-semibold text-lg text-gray-900">
                        Berapa lama waktu pengiriman pesanan?
                     </div>
                     <div className="collapse-content text-gray-700 leading-relaxed">
                        <p>
                           Untuk area kota Bandung: 1-2 hari kerja. Untuk kota besar lainnya: 2-3 hari kerja. Untuk area
                           terpencil: 3-5 hari kerja. Semua pesanan dilengkapi dengan nomor resi untuk tracking
                           real-time.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Home;
