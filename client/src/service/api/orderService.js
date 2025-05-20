/* eslint-disable no-useless-catch */
import axiosInstance from "../axiosService";

// Mendapatkan semua order untuk user tertentu
export const getUserOrders = async () => {
  try {
    const response = await axiosInstance.get("/api/orders");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan detail order berdasarkan ID
export const getOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Membuat order baru dari cart
export const createOrder = async (orderData) => {
  try {
    const { name, phone, address, shipping } = orderData;
    const response = await axiosInstance.post("/api/orders", {
      name,
      phone,
      address,
      shipping,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel order (hanya untuk status Menunggu_Konfirmasi)
export const cancelOrder = async (id) => {
  try {
    const response = await axiosInstance.put(`/api/orders/cancel/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Mendapatkan semua order
export const getAllOrders = async (status = null) => {
  try {
    let url = "/api/admin/orders";
    if (status) {
      url += `?status=${status}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Update status order
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(`/api/admin/orders/${id}`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
