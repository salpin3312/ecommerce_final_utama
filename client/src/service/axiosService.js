import axios from "axios";

// Base URL dari API backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Debug: log base URL
console.log("API_URL:", API_URL);

// Membuat instance axios dengan konfigurasi default
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Penting untuk mengirim cookies (session)
});

// Interceptor untuk menangani error secara global
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handling error
    const message =
      error.response?.data?.message || "Terjadi kesalahan pada server";

    // Jika status 401 (Unauthorized), mungkin session expired
    if (error.response?.status === 401) {
      // Optional: redirect ke halaman login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
