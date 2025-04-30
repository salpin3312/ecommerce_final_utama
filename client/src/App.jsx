import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Reports from "./pages/admin/Report";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import {
  PrivateRoute,
  AdminRoute,
  PublicOnlyRoute,
} from "./components/ProtectedRoutes";
import { useEffect, useState, createContext } from "react";
import { getSession } from "./service/api/authService";
import { Toaster } from "react-hot-toast";
import ProductDetail from "./pages/ProductDetail";
import OrderDetail from "./pages/OrderDetail";
import PaymentStatus from "./pages/PaymentStatus";

// Create Auth Context
export const AuthContext = createContext(null);

// Layout component untuk halaman user
const UserLayout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function AppRoutes() {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check session when app loads
    const checkSession = async () => {
      try {
        const { user } = await getSession();
        setAuthState({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.role === "ADMIN",
          isLoading: false,
        });
      } catch (error) {
        console.error("Session check error:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        });
      }
    };

    checkSession();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...authState, setAuthState }}>
      <Routes>
        {/* Auth Routes (tanpa Navbar & Footer) - Hanya untuk user yang belum login */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin Routes (dengan AdminLayout) - Hanya untuk admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        {/* User Routes (dengan Navbar & Footer) */}
        <Route element={<UserLayout />}>
          {/* Public Routes (untuk semua user) */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />

          {/* Protected Routes (hanya untuk user yang login) */}
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/product/detail/:id" element={<ProductDetail />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route
              path="/payment/:status/:orderId"
              element={<PaymentStatus />}
            />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Route>
        </Route>

        {/* Route untuk 404 Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  404 - Halaman Tidak Ditemukan
                </h1>
                <p className="mb-6">
                  Maaf, halaman yang Anda cari tidak tersedia.
                </p>
                <a href="/" className="btn btn-primary">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;
