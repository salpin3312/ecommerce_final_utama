/* eslint-disable no-useless-catch */
import axiosInstance from "../axiosService";

// Mendapatkan semua produk
export const getAllProducts = async (filters = {}) => {
  try {
    const { status, includeArchived } = filters;
    let url = "/api/products";

    // Tambahkan query parameters jika ada
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (includeArchived) params.append("includeArchived", includeArchived);

    // Tambahkan query string ke URL jika ada parameter
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axiosInstance.get(url);
    return response.data.products;
  } catch (error) {
    throw error;
  }
};

// Mendapatkan produk berdasarkan ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Pencarian produk
export const searchProducts = async (keyword) => {
  try {
    const response = await axiosInstance.get(
      `/api/products/search?keyword=${keyword}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menambah produk baru (dengan upload gambar)
export const addProduct = async (productData) => {
  try {
    // Karena ada upload file, kita perlu menggunakan FormData
    const formData = new FormData();

    // Tambahkan field teks
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("stock", productData.stock);

    // Tambahkan sizes (bisa berupa array)
    if (Array.isArray(productData.sizes)) {
      formData.append("sizes", productData.sizes.join(","));
    } else if (productData.sizes) {
      formData.append("sizes", productData.sizes);
    }

    // Tambahkan gambar jika ada
    if (productData.image) {
      formData.append("image", productData.image);
    }

    const response = await axiosInstance.post("/api/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Override Content-Type default
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Memperbarui produk (dengan upload gambar)
export const updateProduct = async (id, productData) => {
  try {
    // Karena ada upload file, kita perlu menggunakan FormData
    const formData = new FormData();

    // Tambahkan field teks (hanya jika ada nilainya)
    if (productData.name) formData.append("name", productData.name);
    if (productData.description)
      formData.append("description", productData.description);
    if (productData.price) formData.append("price", productData.price);
    if (productData.stock) formData.append("stock", productData.stock);

    // Tambahkan sizes (bisa berupa array)
    if (productData.sizes) {
      if (Array.isArray(productData.sizes)) {
        formData.append("sizes", productData.sizes.join(","));
      } else {
        formData.append("sizes", productData.sizes);
      }
    }

    // Tambahkan gambar jika ada
    if (productData.image) {
      formData.append("image", productData.image);
    }

    const response = await axiosInstance.put(`/api/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Override Content-Type default
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengubah status produk
export const updateProductStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/api/products/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Menghapus produk
export const deleteProduct = async (id, forceDelete = false) => {
  try {
    let url = `/api/products/${id}`;
    if (forceDelete) {
      url += `?forceDelete=true`;
    }

    const response = await axiosInstance.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};
