import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, ShoppingBag, Mail } from "lucide-react";

function Footer() {
   const [showSizeGuide, setShowSizeGuide] = useState(false);

   return (
      <footer className="bg-gradient-to-r from-zinc-200 to-orange-100 text-base-content">
         <div className="container mx-auto px-4 py-10">
            <div className="footer">
               {/* About Section */}
               <div>
                  <Link to="/" className="flex items-center space-x-2 mb-4">
                     <ShoppingBag className="h-6 w-6" />
                     <span className="font-bold text-xl">Screamble</span>
                  </Link>
                  <p className="max-w-xs">
                     Scramble adalah tujuan utama Anda untuk fashion trendi dan terjangkau. Kami menghadirkan gaya
                     terbaru dengan kualitas tanpa kompromi.
                  </p>
                  <div className="mt-4">
                     <div className="grid grid-flow-col gap-4">
                        <a href="#" className="link link-hover">
                           <Facebook size={20} />
                        </a>
                        <a
                           href="https://www.instagram.com/screambleee?igsh=MXNzeW9xZTJjcDliMg=="
                           className="link link-hover">
                           <Instagram size={20} />
                        </a>
                        <a href="#" className="link link-hover">
                           <Twitter size={20} />
                        </a>
                        <a href="#" className="link link-hover">
                           <Youtube size={20} />
                        </a>
                     </div>
                  </div>
               </div>

               {/* Quick Links */}
               <div>
                  <span className="footer-title">Quick Links</span>
                  <Link to="/" className="link link-hover">
                     Home
                  </Link>
                  <Link to="/shop" className="link link-hover">
                     Produk
                  </Link>
                  <Link to="/about" className="link link-hover">
                     Tentang Kami
                  </Link>
               </div>

               {/* Customer Service */}
               <div>
                  <span className="footer-title">Customer Service</span>
                  <a
                     className="link link-hover"
                     href="/"
                     onClick={(e) => {
                        if (window.location.pathname === "/") {
                           e.preventDefault();
                           const faqSection = document.getElementById("faq");
                           if (faqSection) {
                              faqSection.scrollIntoView({ behavior: "smooth" });
                           }
                        }
                     }}>
                     FAQ
                  </a>
                  <a className="link link-hover">Returns & Exchanges</a>
                  <a className="link link-hover">Shipping Information</a>
                  <a className="link link-hover" onClick={() => setShowSizeGuide(true)} style={{ cursor: "pointer" }}>
                     Size Guide
                  </a>
               </div>

               {/* Newsletter */}
               <div>
                  <span className="footer-title">Stay Updated</span>
                  <div className="form-control w-80">
                     <label className="label">
                        <span className="label-text">Subscribe to our newsletter</span>
                     </label>
                     <div className="relative">
                        <input type="text" placeholder="Your email" className="input input-bordered w-full pr-16" />
                        <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">
                           <Mail className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-base-300">
               <div className="flex flex-col md:flex-row justify-between items-center">
                  <p>© {new Date().getFullYear()} Screamble. All rights reserved.</p>
                  <div className="mt-4 md:mt-0">
                     <a className="link link-hover mr-4">Privacy Policy</a>
                     <a className="link link-hover">Terms of Service</a>
                  </div>
               </div>
            </div>
         </div>

         {/* Size Guide Modal */}
         {showSizeGuide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                  <button
                     className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                     onClick={() => setShowSizeGuide(false)}
                     aria-label="Close Size Guide">
                     &times;
                  </button>
                  <h3 className="text-2xl font-semibold mb-4 text-center">Size Guide</h3>
                  <table className="min-w-full text-sm text-center border border-gray-200">
                     <thead>
                        <tr className="bg-gray-100">
                           <th className="px-4 py-2 border">Size</th>
                           <th className="px-4 py-2 border">Chest (cm)</th>
                           <th className="px-4 py-2 border">Length (cm)</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td className="border px-4 py-2">S</td>
                           <td className="border px-4 py-2">92</td>
                           <td className="border px-4 py-2">68</td>
                        </tr>
                        <tr>
                           <td className="border px-4 py-2">M</td>
                           <td className="border px-4 py-2">100</td>
                           <td className="border px-4 py-2">70</td>
                        </tr>
                        <tr>
                           <td className="border px-4 py-2">L</td>
                           <td className="border px-4 py-2">108</td>
                           <td className="border px-4 py-2">72</td>
                        </tr>
                        <tr>
                           <td className="border px-4 py-2">XL</td>
                           <td className="border px-4 py-2">116</td>
                           <td className="border px-4 py-2">74</td>
                        </tr>
                     </tbody>
                  </table>
                  <p className="mt-4 text-xs text-gray-500 text-center">
                     *Ukuran dapat sedikit berbeda tergantung model produk.
                  </p>
               </div>
            </div>
         )}
      </footer>
   );
}

export default Footer;
