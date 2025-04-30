import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaSignOutAlt,
  FaBars,
  FaChartBar,
} from "react-icons/fa";
import { logout } from "../service/api/authService";
import { useContext } from "react";
import { AuthContext } from "../App";
import toast from "react-hot-toast";

function AdminLayout() {
  const location = useLocation();
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
      toast.success("Logout successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500); // Delay 1.5 detik agar toast sempat tampil
    } catch (error) {
      toast.error("Logout failed");
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { path: "/admin", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/admin/products", icon: <FaBox />, label: "Products" },
    { path: "/admin/orders", icon: <FaClipboardList />, label: "Orders" },
    { path: "/admin/reports", icon: <FaChartBar />, label: "Reports" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-zinc-200 to-orange-100">
      {/* Mobile Navigation */}
      <div className="navbar bg-gradient-to-r from-zinc-200 to-orange-100 lg:hidden">
        <div className="flex-none">
          <label
            htmlFor="admin-drawer"
            className="btn btn-square btn-ghost drawer-button"
          >
            <FaBars className="h-5 w-5" />
          </label>
        </div>
        <div className="flex-1">
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
      </div>

      <div className="drawer lg:drawer-open">
        <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

        {/* Main Content */}
        <div className="drawer-content flex flex-col">
          <main className="flex-1 overflow-y-auto bg-base-200 p-6">
            <Outlet />
          </main>
        </div>

        {/* Sidebar */}
        <div className="drawer-side">
          <label
            htmlFor="admin-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <aside className="bg-base-100 w-80 min-h-full border-r">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-200"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
                <li className="mt-8">
                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    className="flex items-center gap-4 p-3 rounded-lg text-error hover:bg-base-200 w-full transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
