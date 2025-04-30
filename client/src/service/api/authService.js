import axiosInstance from "../axiosService";

// Fungsi login
export const login = async (credentials) => {
  const response = await axiosInstance.post("/api/login", credentials);
  return response.data;
};

// Fungsi register
export const register = async (userData) => {
  const response = await axiosInstance.post("/api/register", userData);
  return response.data;
};

// Fungsi logout
export const logout = async () => {
  try {
    const response = await axiosInstance.post("/api/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    // Pastikan UI tetap bersih meskipun terjadi error
    throw error;
  }
};

// Fungsi untuk mendapatkan session user
export const getSession = async () => {
  try {
    const response = await axiosInstance.get("/api/session");
    return response.data;
  } catch (error) {
    // Jika error 401, artinya tidak ada session aktif
    if (error.response?.status === 401) {
      return { user: null };
    }
  }
};

// Fungsi untuk mengecek role user dari session
export const getUserRole = async () => {
  try {
    const { user } = await getSession();
    return user?.role || null;
  } catch (error) {
    return null;
  }
};

// Fungsi untuk mengecek apakah user adalah admin dari session
export const checkIsAdmin = async () => {
  try {
    const { user } = await getSession();
    return user?.role === "ADMIN";
  } catch (error) {
    return false;
  }
};
