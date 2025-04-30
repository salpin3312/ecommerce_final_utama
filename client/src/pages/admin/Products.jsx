import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  searchProducts,
  updateProduct,
} from "../../service/api/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sizes: "", // Updated from size to sizes to match API
    stock: "",
    image: null,
  });

  // Gambar preview
  const [imagePreview, setImagePreview] = useState(null);

  // Loading state untuk tombol form
  const [isSaving, setIsSaving] = useState(false);

  // Fetch products saat komponen dimount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await getAllProducts();
      console.log(products);
      setProducts(products || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Gagal mengambil data produk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Handle pencarian dengan debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm.trim()) {
      const timeoutId = setTimeout(async () => {
        try {
          setLoading(true);
          const response = await searchProducts(searchTerm);
          setProducts(response.products || []);
        } catch (err) {
          console.error("Error searching products:", err);
        } finally {
          setLoading(false);
        }
      }, 500); // Debounce 500ms

      setSearchTimeout(timeoutId);
    } else {
      // Jika search kosong, kembali ke semua produk
      fetchProducts();
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Handle edit
  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(",")
        : product.sizes || "",
      stock: product.stock.toString(),
      image: null,
    });

    // Set image preview jika ada
    if (product.imageUrl) {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      // Hapus "/api" jika sudah termasuk dalam URL gambar
      const imageUrl = product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `${apiBaseUrl.replace(/\/api$/, "")}${product.imageUrl}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }

    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await deleteProduct(id);
        // Refresh list setelah hapus
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(
          "Gagal menghapus produk. " +
            (err.response?.data?.message || "Silakan coba lagi.")
        );
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Buat URL preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      if (currentProduct) {
        // Update produk
        await updateProduct(currentProduct.id, formData);
      } else {
        // Tambah produk baru
        await addProduct(formData);
      }

      // Reset form dan tutup modal
      resetForm();
      setShowModal(false);

      // Refresh list produk
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert(
        "Gagal menyimpan produk. " +
          (err.response?.data?.message || "Silakan coba lagi.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      sizes: "",
      stock: "",
      image: null,
    });
    setImagePreview(null);
    setCurrentProduct(null);
  };

  // Handle modal close
  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Produk</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FaPlus className="inline mr-2" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari produk..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <p>Memuat data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="text-center py-4">
                <p>Tidak ada produk yang ditemukan.</p>
              </div>
            ) : (
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Gambar</th>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Ukuran</th>
                    <th className="px-4 py-2 text-left">Stok</th>
                    <th className="px-4 py-2 text-left">Harga</th>
                    <th className="px-4 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="px-4 py-2">
                        {product.imageUrl ? (
                          <img
                            src={`${
                              import.meta.env.VITE_API_URL?.replace(
                                /\/api$/,
                                ""
                              ) || "http://localhost:8000"
                            }${product.imageUrl}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              // Fallback jika gambar tidak ditemukan
                              e.target.src = `https://placehold.co/100x100?text=${product.name.charAt(
                                0
                              )}`;
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                            <span className="text-gray-500 text-xl">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">
                        {Array.isArray(product.sizes)
                          ? product.sizes
                              .sort((a, b) => {
                                const sizeOrder = [
                                  "XS",
                                  "S",
                                  "M",
                                  "L",
                                  "XL",
                                  "XXL",
                                  "XXXL",
                                ];
                                return (
                                  sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
                                );
                              })
                              .join(", ")
                          : product.sizes || product.size}
                      </td>
                      <td className="px-4 py-2">{product.stock}</td>
                      <td className="px-4 py-2">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(product.price)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          onClick={() => handleEdit(product)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(product.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold mb-4">
              {currentProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Nama</span>
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama produk"
                      className="input input-bordered w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Harga</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      placeholder="Harga produk"
                      className="input input-bordered w-full"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Deskripsi</span>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Deskripsi produk"
                      className="textarea textarea-bordered w-full h-24"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Ukuran</span>
                    </div>
                    <input
                      type="text"
                      name="sizes"
                      placeholder="Ukuran produk"
                      className="input input-bordered w-full"
                      value={formData.sizes}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Untuk multi ukuran, pisahkan dengan koma (S,M,L)
                    </p>
                  </label>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Stok</span>
                    </div>
                    <input
                      type="number"
                      name="stock"
                      placeholder="Jumlah stok"
                      className="input input-bordered w-full"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text font-bold">Foto Produk</span>
                    </div>
                    <input
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/jpg"
                      className="file-input file-input-bordered w-full"
                      onChange={handleFileChange}
                      // Hanya required jika tambah produk baru
                      required={!currentProduct}
                    />
                  </label>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition-colors"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
