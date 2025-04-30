import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ShoppingBag,
  Mail,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-zinc-200 to-orange-100 text-base-content">
      <div className="container mx-auto px-4 py-10">
        <div className="footer">
          {/* About Section */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="h-6 w-6" />
              <span className="font-bold text-xl">Scramble</span>
            </Link>
            <p className="max-w-xs">
              Scramble adalah tujuan utama Anda untuk fashion trendi dan
              terjangkau. Kami menghadirkan gaya terbaru dengan kualitas tanpa
              kompromi.
            </p>
            <div className="mt-4">
              <div className="grid grid-flow-col gap-4">
                <a href="#" className="link link-hover">
                  <Facebook size={20} />
                </a>
                <a href="#" className="link link-hover">
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
            <a className="link link-hover">Home</a>
            <a className="link link-hover">Produk</a>
            <a className="link link-hover">Tentang Kami</a>
          </div>

          {/* Customer Service */}
          <div>
            <span className="footer-title">Customer Service</span>
            <a className="link link-hover">FAQ</a>
            <a className="link link-hover">Returns & Exchanges</a>
            <a className="link link-hover">Shipping Information</a>
            <a className="link link-hover">Size Guide</a>
          </div>

          {/* Newsletter */}
          <div>
            <span className="footer-title">Stay Updated</span>
            <div className="form-control w-80">
              <label className="label">
                <span className="label-text">Subscribe to our newsletter</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your email"
                  className="input input-bordered w-full pr-16"
                />
                <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-base-300">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} Scramble. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a className="link link-hover mr-4">Privacy Policy</a>
              <a className="link link-hover">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
