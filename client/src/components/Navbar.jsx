import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBars } from "react-icons/fa";
import { logout } from "../service/api/authService";
import { AuthContext } from "../App";
import { getUserCart } from "../service/api/cartService";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, setAuthState } = useContext(AuthContext);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch cart items count
  useEffect(() => {
    if (isAuthenticated && user?.role === "USER") {
      fetchCartCount();
    }
  }, [isAuthenticated, user, location]);

  // This effect will listen for changes in location to update cart count
  // when users navigate between pages or after adding items to cart
  useEffect(() => {
    if (isAuthenticated && user?.role === "USER") {
      // Listen to custom event for cart updates
      window.addEventListener("cartUpdated", fetchCartCount);
      return () => window.removeEventListener("cartUpdated", fetchCartCount);
    }
  }, [isAuthenticated, user]);

  const fetchCartCount = async () => {
    try {
      const data = await getUserCart();
      const count = data.cart
        ? data.cart.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
      setCartItemCount(count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Produk" },
    { to: "/about", label: "Tentang Kami" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Update auth context
      setAuthState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-md bg-base-100/50" : ""
      }`}
    >
      <div className="container mx-auto">
        <div className="navbar">
          <div className="navbar-start">
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost lg:hidden">
                <FaBars className="h-5 w-5" />
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`text-base ${
                        isActive(link.to) ? "font-bold" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/" className="text-xl font-bold">
              Scramble
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`text-base px-4 py-2 ${
                      isActive(link.to)
                        ? "font-semibold border-b-2 rounded-none border-primary"
                        : "hover:text-primary transition-colors"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="navbar-end">
            {isAuthenticated && user ? (
              <>
                {user.role === "USER" && (
                  <Link to="/cart" className="btn btn-ghost btn-circle mr-2">
                    <div className="indicator">
                      <FaShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <span className="indicator-item badge badge-secondary">
                          {cartItemCount}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  </label>
                  <ul
                    tabIndex={0}
                    className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                  >
                    <li className="menu-title px-4 py-2">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs block opacity-70">
                        {user.email}
                      </span>
                    </li>
                    {user.role === "ADMIN" && (
                      <li>
                        <Link to="/admin" className="justify-between">
                          Admin Dashboard
                          <span className="badge badge-primary">Admin</span>
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link to="/profile" className="justify-between">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <a onClick={handleLogout}>Logout</a>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
