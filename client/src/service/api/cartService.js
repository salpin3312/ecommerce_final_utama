/* eslint-disable no-useless-catch */
import axiosInstance from "../axiosService";

// Mendapatkan semua cart items untuk user tertentu
export const getUserCart = async () => {
  try {
    const response = await axiosInstance.get("/api/cart");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menambahkan item ke cart
export const addToCart = async (productId, size, quantity) => {
  try {
    const response = await axiosInstance.post("/api/cart", {
      productId,
      size,
      quantity,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengupdate quantity item di cart
export const updateCartItem = async (cartId, quantity, size) => {
  try {
    const response = await axiosInstance.put(`/api/cart/${cartId}`, {
      quantity,
      size,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus item dari cart
export const removeFromCart = async (cartId) => {
  try {
    const response = await axiosInstance.delete(`/api/cart/${cartId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus semua item di cart untuk user tertentu
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete("/api/cart");
    return response.data;
  } catch (error) {
    throw error;
  }
};
