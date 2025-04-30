/* eslint-disable no-useless-catch */
import axiosInstance from "../axiosService";

// Membuat Snap Token untuk pembayaran Midtrans
export const createSnapToken = async (paymentData) => {
  try {
    const response = await axiosInstance.post(
      "/api/payment/snap-token",
      paymentData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan status pembayaran
export const getPaymentStatus = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/payment/status/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Melakukan charge pembayaran
export const chargePayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post(
      "/api/payment/charge",
      paymentData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
