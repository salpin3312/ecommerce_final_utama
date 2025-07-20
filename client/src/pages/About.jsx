import { Link } from "react-router-dom";
import { Smile, Shirt, Leaf, ThumbsUp, MapPin, MessageCircle, Phone, Mail } from "lucide-react";

function About() {
   return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100">
         {/* Header Section */}
         <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
               <h1 className="text-5xl md:text-6xl font-bold mb-6">Tentang Kami</h1>
               <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
                  <strong>Screamble</strong> adalah brand lokal yang berdedikasi untuk memberikan kaos dengan desain
                  unik, kualitas terbaik, dan kenyamanan luar biasa.
               </p>
            </div>
         </div>

         <div className="max-w-6xl mx-auto px-6">
            {/* Brand Philosophy */}
            <div className="py-16 text-center">
               <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Filosofi Brand Kami</h2>
               <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                  Kami percaya bahwa kaos bukan hanya pakaian, tapi juga bentuk ekspresi diri. Setiap produk yang kami
                  ciptakan mengandung cerita, passion, dan komitmen terhadap kualitas yang tidak pernah berkompromi.
               </p>
            </div>

            {/* Brand Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
               <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center border border-gray-100">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                     <Shirt className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-gray-800">Kualitas Premium</h4>
                  <p className="text-gray-600 leading-relaxed">
                     Kaos kami dibuat dari bahan pilihan yang lembut dan tahan lama, cocok untuk dipakai harian.
                  </p>
               </div>

               <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center border border-gray-100">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                     <Leaf className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-gray-800">Sustainable</h4>
                  <p className="text-gray-600 leading-relaxed">
                     Kami peduli lingkungan. Proses produksi kami ramah lingkungan dan mendukung etika kerja yang adil.
                  </p>
               </div>

               <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center border border-gray-100">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                     <Smile className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-gray-800">Nyaman Dipakai</h4>
                  <p className="text-gray-600 leading-relaxed">
                     Kenyamanan adalah prioritas utama. Desain dan potongan kami cocok untuk berbagai bentuk tubuh.
                  </p>
               </div>

               <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center border border-gray-100">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                     <ThumbsUp className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-gray-800">Layanan Terbaik</h4>
                  <p className="text-gray-600 leading-relaxed">
                     Tim kami siap membantu Anda kapan saja untuk memastikan pengalaman belanja yang menyenangkan.
                  </p>
               </div>
            </div>

            {/* Story Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 mb-20">
               <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Cerita Kami</h2>
                  <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                     Berdiri sejak 2023, Screamble telah melayani ratusan pelanggan dari seluruh Indonesia. Kami terus
                     berkembang dan berinovasi agar dapat menghadirkan produk yang tidak hanya modis, tetapi juga
                     bermakna.
                  </p>
                  <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                     Dari studio kecil di Bandung, kami kini telah menjangkau seluruh nusantara dengan komitmen yang
                     sama: menghadirkan kaos berkualitas tinggi yang mencerminkan kepribadian unik setiap pemakainya.
                  </p>
                  <Link
                     to="/shop"
                     className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                     Jelajahi Koleksi Kami
                  </Link>
               </div>
            </div>

            {/* Contact & Location Section */}
            <div className="mb-20">
               <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Hubungi Kami</h2>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Contact Info */}
                  <div className="space-y-8">
                     <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Informasi Kontak</h3>

                        {/* WhatsApp */}
                        <a
                           href="https://wa.me/6285864411508?text=Halo%20Screamble!%20Saya%20tertarik%20dengan%20produk%20kalian"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300 group mb-4">
                           <div className="bg-green-500 rounded-full p-3 mr-4 group-hover:bg-green-600 transition-colors">
                              <MessageCircle className="w-6 h-6 text-white" />
                           </div>
                           <div>
                              <h4 className="font-semibold text-gray-800">WhatsApp</h4>
                              <p className="text-gray-600">+62 858-6441-1508</p>
                              <p className="text-sm text-green-600">Klik untuk chat langsung</p>
                           </div>
                        </a>

                        {/* Phone */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-4">
                           <div className="bg-gray-500 rounded-full p-3 mr-4">
                              <Phone className="w-6 h-6 text-white" />
                           </div>
                           <div>
                              <h4 className="font-semibold text-gray-800">Telepon</h4>
                              <p className="text-gray-600">+62 21-1234-5678</p>
                           </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-4">
                           <div className="bg-gray-500 rounded-full p-3 mr-4">
                              <Mail className="w-6 h-6 text-white" />
                           </div>
                           <div>
                              <h4 className="font-semibold text-gray-800">Email</h4>
                              <p className="text-gray-600">hello@screamble.id</p>
                           </div>
                        </div>

                        {/* Instagram */}
                        <a
                           href="https://www.instagram.com/screambleee?igsh=MXNzeW9xZTJjcDliMg=="
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all duration-300 group mb-4">
                           <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 mr-4 group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                           </div>
                           <div>
                              <h4 className="font-semibold text-gray-800">Instagram</h4>
                              <p className="text-gray-600">@screamble.id</p>
                              <p className="text-sm text-pink-600">Follow untuk update terbaru</p>
                           </div>
                        </a>

                        {/* Address */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                           <div className="bg-gray-500 rounded-full p-3 mr-4">
                              <MapPin className="w-6 h-6 text-white" />
                           </div>
                           <div>
                              <h4 className="font-semibold text-gray-800">Alamat</h4>
                              <p className="text-gray-600">
                                 Jl. Pandawa Blok D No.22
                                 <br />
                                 Kab. Bandung 40375
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Map */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                     <div className="h-full min-h-[400px] relative">
                        <iframe
                           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d989.9748389572129!2d107.6582240189684!3d-7.0211154615517675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68ea0fcd17d879%3A0xbb8e8a96ccf6b6b6!2sJl.%20Pandu%2C%20Jelekong%2C%20Kec.%20Baleendah%2C%20Kabupaten%20Bandung%2C%20Jawa%20Barat%2040375!5e0!3m2!1sid!2sid!4v1751893794885!5m2!1sid!2sid"
                           width="100%"
                           height="100%"
                           style={{ border: 0, minHeight: "400px" }}
                           allowFullScreen
                           loading="lazy"
                           referrerPolicy="no-referrer-when-downgrade"
                           className="rounded-2xl"></iframe>
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                           <div className="flex items-center">
                              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                              <div>
                                 <p className="font-semibold text-sm text-gray-800">Screamble</p>
                                 <p className="text-xs text-gray-600">Baleendah, Kab. Bandung</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-12 mb-12 text-white">
               <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap Bergabung dengan Screamble?</h2>
               <p className="text-xl mb-8 opacity-90">Temukan kaos yang sempurna untuk mengekspresikan diri Anda</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                     to="/shop"
                     className="inline-block bg-white text-gray-800 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                     Belanja Sekarang
                  </Link>
                  <a
                     href="https://wa.me/6285864411508?text=Halo%20Screamble!%20Saya%20ingin%20tahu%20lebih%20banyak%20tentang%20produk%20kalian"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                     Chat via WhatsApp
                  </a>
               </div>
            </div>
         </div>
      </div>
   );
}

export default About;
