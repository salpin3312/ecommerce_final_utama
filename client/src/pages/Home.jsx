import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, Phone, RefreshCcw, ShoppingCart } from "lucide-react";
import ProductCard from "../components/Product-Card";
import { getAllProducts } from "../service/api/productService";
import HomeLottie from "../components/HomeLottie";

function Home() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const data = await getAllProducts();
            console.log(data);
            setProducts(data);
         } catch (error) {
            setError("Gagal mengambil produk");
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   return (
      <div className="min-h-screen bg-gradient-to-r from-zinc-200 to-orange-100 pb-10">
         {/* Bagian Hero */}
         <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
               <div className="w-1/2 ms-14">
                  <HomeLottie />
               </div>
               <div>
                  <h1 className="text-5xl font-bold">Selamat Datang di Screamble</h1>
                  <p className="py-6">
                     Temukan koleksi kaos unik dan nyaman kami. Ekspresikan diri Anda
                     dengan desain kami!
                  </p>
                  <Link to="/shop" className="btn btn-primary">
                     <ShoppingCart className="mr-2" />
                     Belanja Sekarang
                  </Link>
               </div>
            </div>
         </div>

         {/* Bagian Keunggulan */}
         <div className="py-16 bg-base-100">
            <div className="container mx-auto px-4">
               <h2 className="text-3xl font-bold text-center mb-8">
                  Mengapa Memilih Kami?
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="card bg-gradient-to-r from-zinc-300 to-orange-200 shadow-xl">
                     <div className="card-body items-center text-center">
                        <Truck className="w-12 h-12 text-primary" />
                        <h3 className="card-title">Gratis Pengiriman</h3>
                        <p>Untuk pesanan di atas Rp750.000</p>
                     </div>
                  </div>
                  <div className="card bg-gradient-to-r from-zinc-300 to-orange-200 shadow-xl">
                     <div className="card-body items-center text-center">
                        <Phone className="w-12 h-12 text-primary" />
                        <h3 className="card-title">Dukungan 24/7</h3>
                        <p>Selalu siap membantu Anda</p>
                     </div>
                  </div>
                  <div className="card bg-gradient-to-r from-zinc-300 to-orange-200 shadow-xl">
                     <div className="card-body items-center text-center">
                        <RefreshCcw className="w-12 h-12 text-primary" />
                        <h3 className="card-title">Pengembalian Mudah</h3>
                        <p>Kebijakan pengembalian 30 hari</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Bagian Produk Unggulan */}
         <div className="py-16 bg-gradient-to-r from-zinc-200 to-orange-100">
            <div className="container mx-auto px-4">
               <h2 className="text-3xl font-bold text-center mb-8">Produk Unggulan</h2>
               {loading ? (
                  <p className="text-center">Memuat produk...</p>
               ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                     ))}
                  </div>
               )}
            </div>
         </div>

         <div className="w-1/2 mx-auto h-full">
            <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300">
               <input type="radio" name="my-accordion-2" defaultChecked />
               <div className="collapse-title font-semibold">
                  Bagaimana cara membuat akun?
               </div>
               <div className="collapse-content text-sm">
                  Klik tombol "Daftar" di pojok kanan atas dan ikuti proses pendaftaran.
               </div>
            </div>
            <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300">
               <input type="radio" name="my-accordion-2" />
               <div className="collapse-title font-semibold">
                  Saya lupa kata sandi. Apa yang harus saya lakukan?
               </div>
               <div className="collapse-content text-sm">
                  Klik "Lupa Kata Sandi" pada halaman login dan ikuti instruksi yang
                  dikirim ke email Anda.
               </div>
            </div>
            <div className="collapse collapse-arrow bg-gradient-to-r from-zinc-300 to-orange-200 border border-base-300">
               <input type="radio" name="my-accordion-2" />
               <div className="collapse-title font-semibold">
                  Bagaimana cara memperbarui informasi profil saya?
               </div>
               <div className="collapse-content text-sm">
                  Buka pengaturan "Akun Saya" dan pilih "Edit Profil" untuk melakukan
                  perubahan.
               </div>
            </div>
         </div>
      </div>
   );
}

export default Home;
