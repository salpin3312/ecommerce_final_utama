import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../App";

// Route untuk user yang sudah login
export const PrivateRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    // Redirect ke login jika belum login, simpan intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Route khusus untuk admin
export const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Redirect ke home jika bukan admin
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Route untuk user yang belum login (seperti login/register page)
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (isAuthenticated) {
    // Redirect ke admin dashboard atau home
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
};
