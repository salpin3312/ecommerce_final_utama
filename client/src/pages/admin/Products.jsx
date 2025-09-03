import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
   addProduct,
   deleteProduct,
   getAllProducts,
   searchProducts,
   updateProduct,
   updateProductStatus,
} from "../../service/api/productService";
import { toast } from "react-hot-toast";

function Products() {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const [showModal, setShowModal] = useState(false);
   const [showStatusModal, setShowStatusModal] = useState(false);
   const [currentProduct, setCurrentProduct] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [searchTimeout, setSearchTimeout] = useState(null);
   const [statusFilter, setStatusFilter] = useState("");
   const [includeArchived, setIncludeArchived] = useState(false);

   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage] = useState(6);

   // Form state
   const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      sizes: "", // Updated from size to sizes to match API
      stock: "",
      image: null,
      // Kolom untuk fitur diskon
      discountPercentage: "",
      discountStartDate: "",
      discountEndDate: "",
      isDiscountActive: false,
   });

   // Gambar preview
   const [imagePreview, setImagePreview] = useState(null);

   // Loading state untuk tombol form
   const [isSaving, setIsSaving] = useState(false);

   // State untuk form status
   const [statusData, setStatusData] = useState({
      status: "",
   });

   // Fetch products saat komponen dimount atau filter berubah
   useEffect(() => {
      fetchProducts();
   }, [statusFilter, includeArchived]);

   // Fetch products function
   const fetchProducts = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await getAllProducts({
            status: statusFilter || undefined,
            includeArchived: includeArchived ? "true" : undefined,
         });
         setProducts(data);
      } catch (err) {
         console.error("Error fetching products:", err);
         setError("Gagal memuat data produk. Silakan coba lagi.");
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
               // Filter berdasarkan status jika ada filter
               let filteredProducts = response.products || [];
               if (statusFilter) {
                  filteredProducts = filteredProducts.filter((p) => p.status === statusFilter);
               }
               if (!includeArchived) {
                  filteredProducts = filteredProducts.filter((p) => p.status !== "ARCHIVED");
               }
               setProducts(filteredProducts);
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
   }, [searchTerm, statusFilter, includeArchived]);

   // Handle edit
   const handleEdit = (product) => {
      setCurrentProduct(product);
      setFormData({
         name: product.name,
         description: product.description,
         price: product.price.toString(),
         sizes: Array.isArray(product.sizes) ? product.sizes.join(",") : product.sizes || "",
         stock: product.stock.toString(),
         image: null,
         // Data diskon
         discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : "",
         discountStartDate: product.discountStartDate
            ? new Date(product.discountStartDate).toISOString().split("T")[0]
            : "",
         discountEndDate: product.discountEndDate ? new Date(product.discountEndDate).toISOString().split("T")[0] : "",
         isDiscountActive: product.isDiscountActive || false,
      });

      // Set image preview jika ada
      if (product.imageUrl) {
         const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
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

   // Handle status change
   const handleStatusChange = (product) => {
      setCurrentProduct(product);
      setStatusData({
         status: product.status,
      });
      setShowStatusModal(true);
   };

   // Handle delete
   const handleDelete = async (id) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
         try {
            const response = await deleteProduct(id);
            // Refresh list setelah hapus
            fetchProducts();
            // Tampilkan pesan sukses
            toast.success(response.message || "Produk berhasil dihapus");
         } catch (err) {
            console.error("Error deleting product:", err);

            // Jika produk tidak dapat dihapus karena masih digunakan
            if (err.response && err.response.data && err.response.data.message) {
               // Tampilkan pesan error
               toast.error(err.response.data.message);

               // Tanyakan apakah ingin force delete
               if (
                  err.response.data.message.includes("keranjang") &&
                  window.confirm(
                     "Produk ini masih ada di keranjang pengguna. Apakah Anda ingin menghapus paksa? Ini akan menghapus produk dari semua keranjang."
                  )
               ) {
                  try {
                     const forceResponse = await deleteProduct(id, true);
                     fetchProducts();
                     toast.success(forceResponse.message || "Produk berhasil dihapus paksa");
                  } catch (forceErr) {
                     toast.error(
                        "Gagal menghapus paksa: " + (forceErr.response?.data?.message || "Silakan coba lagi.")
                     );
                  }
               }
            } else {
               toast.error("Gagal menghapus produk. Silakan coba lagi.");
            }
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

   // Handle status input change
   const handleStatusInputChange = (e) => {
      const { name, value } = e.target;
      setStatusData((prev) => ({
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
         toast.error("Gagal menyimpan produk. " + (err.response?.data?.message || "Silakan coba lagi."));
      } finally {
         setIsSaving(false);
      }
   };

   // Handle status form submit
   const handleStatusSubmit = async (e) => {
      e.preventDefault();

      try {
         setIsSaving(true);

         const response = await updateProductStatus(currentProduct.id, statusData.status);

         // Reset form dan tutup modal
         setShowStatusModal(false);
         setCurrentProduct(null);

         // Refresh list produk
         fetchProducts();

         // Tampilkan pesan sukses
         toast.success(response.message || "Status produk berhasil diubah");
      } catch (err) {
         console.error("Error updating product status:", err);
         toast.error("Gagal mengubah status produk. " + (err.response?.data?.message || "Silakan coba lagi."));
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
         // Reset data diskon
         discountPercentage: "",
         discountStartDate: "",
         discountEndDate: "",
         isDiscountActive: false,
      });
      setImagePreview(null);
      setCurrentProduct(null);
   };

   // Handle modal close
   const handleCloseModal = () => {
      resetForm();
      setShowModal(false);
   };

   // Handle status modal close
   const handleCloseStatusModal = () => {
      setCurrentProduct(null);
      setShowStatusModal(false);
   };

   // Get status badge color
   const getStatusBadgeColor = (status) => {
      switch (status) {
         case "ACTIVE":
            return "bg-green-100 text-green-800";
         case "OUT_OF_STOCK":
            return "bg-yellow-100 text-yellow-800";
         case "DISCONTINUED":
            return "bg-red-100 text-red-800";
         case "DRAFT":
            return "bg-gray-100 text-gray-800";
         case "ARCHIVED":
            return "bg-purple-100 text-purple-800";
         default:
            return "bg-blue-100 text-blue-800";
      }
   };

   // Get status display name
   const getStatusDisplayName = (status) => {
      switch (status) {
         case "ACTIVE":
            return "Aktif";
         case "OUT_OF_STOCK":
            return "Stok Habis";
         case "DISCONTINUED":
            return "Dihentikan";
         case "DRAFT":
            return "Draft";
         case "ARCHIVED":
            return "Diarsipkan";
         default:
            return status;
      }
   };

   // Pagination calculations
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
   const totalPages = Math.ceil(products.length / itemsPerPage);

   // Handle page change
   const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
      // Scroll to top of table when page changes
      const tableContainer = document.getElementById("products-table");
      if (tableContainer) {
         tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
      }
   };

   // Reset to first page when filters change
   useEffect(() => {
      setCurrentPage(1);
   }, [searchTerm, statusFilter, includeArchived]);

   return (
      <div>
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Produk</h1>
            <button
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
               onClick={() => {
                  resetForm();
                  setShowModal(true);
               }}>
               <FaPlus className="inline mr-2" /> Tambah Produk
            </button>
         </div>

         <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 space-y-2 lg:space-y-0">
               <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative w-full sm:w-auto">
                     <input
                        type="text"
                        placeholder="Cari produk..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                     <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>

                  {!loading && !error && (
                     <div className="text-xs md:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
                        Total: {products.length} produk
                     </div>
                  )}
               </div>

               <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                     <select
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm w-full sm:w-auto"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Semua Status</option>
                        <option value="ACTIVE">Aktif</option>
                        <option value="OUT_OF_STOCK">Stok Habis</option>
                        <option value="DISCONTINUED">Dihentikan</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Diarsipkan</option>
                     </select>
                     <FaFilter className="absolute left-3 top-3 text-gray-400" />
                  </div>

                  <div className="flex items-center">
                     <input
                        type="checkbox"
                        id="includeArchived"
                        checked={includeArchived}
                        onChange={(e) => setIncludeArchived(e.target.checked)}
                        className="mr-2"
                     />
                     <label htmlFor="includeArchived" className="text-sm">
                        Tampilkan Arsip
                     </label>
                  </div>
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
               <div className="overflow-x-auto" id="products-table">
                  {products.length === 0 ? (
                     <div className="text-center py-4">
                        <p>Tidak ada produk yang ditemukan.</p>
                     </div>
                  ) : currentProducts.length === 0 ? (
                     <div className="text-center py-4">
                        <p>Tidak ada produk pada halaman ini.</p>
                     </div>
                  ) : (
                     <table className="table-auto w-full">
                        <thead>
                           <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left">Gambar</th>
                              <th className="px-4 py-2 text-left">Nama</th>
                              <th className="px-4 py-2 text-left">Ukuran</th>
                              <th className="px-4 py-2 text-left">Stok</th>
                              <th className="px-4 py-2 text-left">Terjual</th>
                              <th className="px-4 py-2 text-left">Harga</th>
                              <th className="px-4 py-2 text-left">Diskon</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Aksi</th>
                           </tr>
                        </thead>
                        <tbody>
                           {currentProducts.map((product) => (
                              <tr key={product.id} className="border-b">
                                 <td className="px-4 py-2">
                                    {product.imageUrl ? (
                                       <img
                                          src={`${
                                             import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
                                             "http://localhost:8000"
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
                                          <span className="text-gray-500 text-xl">{product.name.charAt(0)}</span>
                                       </div>
                                    )}
                                 </td>
                                 <td className="px-4 py-2">{product.name}</td>
                                 <td className="px-4 py-2">
                                    {Array.isArray(product.sizes)
                                       ? product.sizes
                                            .sort((a, b) => {
                                               const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
                                               return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                                            })
                                            .join(", ")
                                       : product.sizes || product.size}
                                 </td>
                                 <td className="px-4 py-2">{product.stock}</td>
                                 <td className="px-4 py-2">
                                    <span
                                       className={`font-medium ${
                                          product.soldCount > 0 ? "text-green-600" : "text-gray-400"
                                       }`}>
                                       {product.soldCount || 0}
                                    </span>
                                 </td>
                                 <td className="px-4 py-2">
                                    <div>
                                       <div className="font-medium">
                                          {new Intl.NumberFormat("id-ID", {
                                             style: "currency",
                                             currency: "IDR",
                                             minimumFractionDigits: 0,
                                          }).format(product.price)}
                                       </div>
                                       {product.hasActiveDiscount && (
                                          <div className="text-sm text-green-600 font-medium">
                                             {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                             }).format(product.discountedPrice)}
                                          </div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-4 py-2">
                                    {product.hasActiveDiscount ? (
                                       <div>
                                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                             -{product.discountPercentage}%
                                          </span>
                                          <div className="text-xs text-gray-500 mt-1">
                                             {product.discountStatus.message}
                                          </div>
                                       </div>
                                    ) : (
                                       <span className="text-gray-400 text-sm">-</span>
                                    )}
                                 </td>
                                 <td className="px-4 py-2">
                                    <span
                                       className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(
                                          product.status
                                       )}`}>
                                       {getStatusDisplayName(product.status)}
                                    </span>
                                 </td>
                                 <td className="px-4 py-2">
                                    <div className="flex space-x-2">
                                       <button
                                          className="text-blue-600 hover:text-blue-800"
                                          onClick={() => handleEdit(product)}
                                          title="Edit produk">
                                          <FaEdit />
                                       </button>
                                       <button
                                          className="text-purple-600 hover:text-purple-800"
                                          onClick={() => handleStatusChange(product)}
                                          title="Ubah status">
                                          <FaFilter />
                                       </button>
                                       <button
                                          className="text-red-600 hover:text-red-800"
                                          onClick={() => handleDelete(product.id)}
                                          title="Hapus produk">
                                          <FaTrash />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-3 md:space-y-0">
                        <div className="text-xs md:text-sm text-gray-600 text-center md:text-left w-full md:w-auto">
                           Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, products.length)} dari{" "}
                           {products.length} produk
                        </div>
                        <div className="flex items-center space-x-1 md:space-x-2 w-full md:w-auto justify-center md:justify-start">
                           <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-2 md:px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
                              <FaChevronLeft className="w-3 h-3" />
                              <span className="ml-1 hidden sm:inline">Sebelumnya</span>
                           </button>

                           <div className="flex space-x-1 md:space-x-1 flex-nowrap justify-center max-w-xs md:max-w-none overflow-x-auto">
                              {Array.from({ length: totalPages }, (_, index) => {
                                 const pageNumber = index + 1;
                                 // Show first page, last page, current page, and pages around current page
                                 if (
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                 ) {
                                    return (
                                       <button
                                          key={pageNumber}
                                          onClick={() => handlePageChange(pageNumber)}
                                          className={`px-2 md:px-3 py-1 rounded border text-sm ${
                                             currentPage === pageNumber
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "hover:bg-gray-50"
                                          }`}>
                                          {pageNumber}
                                       </button>
                                    );
                                 } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                    return (
                                       <span key={pageNumber} className="px-1 md:px-2 py-1 text-sm">
                                          ...
                                       </span>
                                    );
                                 }
                                 return null;
                              })}
                           </div>

                           <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-2 md:px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm">
                              <span className="mr-1 hidden sm:inline">Selanjutnya</span>
                              <FaChevronRight className="w-3 h-3" />
                           </button>
                        </div>
                     </div>
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

                        {/* Form Diskon */}
                        <div className="col-span-2">
                           <div className="border rounded-lg p-4 bg-gray-50">
                              <h4 className="font-bold text-lg mb-4">Pengaturan Diskon</h4>

                              <div className="flex items-center mb-4">
                                 <input
                                    type="checkbox"
                                    id="isDiscountActive"
                                    name="isDiscountActive"
                                    checked={formData.isDiscountActive}
                                    onChange={(e) =>
                                       setFormData((prev) => ({
                                          ...prev,
                                          isDiscountActive: e.target.checked,
                                       }))
                                    }
                                    className="mr-2"
                                 />
                                 <label htmlFor="isDiscountActive" className="font-medium">
                                    Aktifkan Diskon
                                 </label>
                              </div>

                              {formData.isDiscountActive && (
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                       <label className="form-control w-full">
                                          <div className="label">
                                             <span className="label-text font-bold">Persentase Diskon (%)</span>
                                          </div>
                                          <input
                                             type="number"
                                             name="discountPercentage"
                                             placeholder="0-100"
                                             className="input input-bordered w-full"
                                             value={formData.discountPercentage}
                                             onChange={handleInputChange}
                                             min="0"
                                             max="100"
                                             step="0.01"
                                          />
                                       </label>
                                    </div>

                                    <div>
                                       <label className="form-control w-full">
                                          <div className="label">
                                             <span className="label-text font-bold">Tanggal Mulai</span>
                                          </div>
                                          <input
                                             type="date"
                                             name="discountStartDate"
                                             className="input input-bordered w-full"
                                             value={formData.discountStartDate}
                                             onChange={handleInputChange}
                                          />
                                       </label>
                                    </div>

                                    <div>
                                       <label className="form-control w-full">
                                          <div className="label">
                                             <span className="label-text font-bold">Tanggal Selesai</span>
                                          </div>
                                          <input
                                             type="date"
                                             name="discountEndDate"
                                             className="input input-bordered w-full"
                                             value={formData.discountEndDate}
                                             onChange={handleInputChange}
                                          />
                                       </label>
                                    </div>
                                 </div>
                              )}
                           </div>
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
                                 <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded" />
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex justify-end mt-6">
                        <button
                           type="button"
                           className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition-colors"
                           onClick={handleCloseModal}
                           disabled={isSaving}>
                           Batal
                        </button>
                        <button
                           type="submit"
                           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                           disabled={isSaving}>
                           {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {showStatusModal && currentProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-8 max-w-md w-full">
                  <h3 className="text-2xl font-semibold mb-4">Ubah Status Produk</h3>
                  <form className="space-y-4" onSubmit={handleStatusSubmit}>
                     <div>
                        <label className="form-control w-full">
                           <div className="label">
                              <span className="label-text font-bold">Status</span>
                           </div>
                           <select
                              name="status"
                              className="select select-bordered w-full"
                              value={statusData.status}
                              onChange={handleStatusInputChange}
                              required>
                              <option value="" disabled>
                                 Pilih status
                              </option>
                              <option value="ACTIVE">Aktif</option>
                              <option value="OUT_OF_STOCK">Stok Habis</option>
                              <option value="DISCONTINUED">Dihentikan</option>
                              <option value="DRAFT">Draft</option>
                              <option value="ARCHIVED">Diarsipkan</option>
                           </select>
                        </label>
                        <div className="mt-2">
                           <p className="text-sm text-gray-500">
                              {statusData.status === "ACTIVE" &&
                                 "Produk akan ditampilkan di katalog dan tersedia untuk dibeli."}
                              {statusData.status === "OUT_OF_STOCK" &&
                                 "Produk akan ditampilkan di katalog tetapi tidak tersedia untuk dibeli."}
                              {statusData.status === "DISCONTINUED" &&
                                 "Produk tidak akan ditampilkan di katalog dan tidak tersedia untuk dibeli."}
                              {statusData.status === "DRAFT" &&
                                 "Produk masih dalam tahap pembuatan dan tidak akan ditampilkan di katalog."}
                              {statusData.status === "ARCHIVED" &&
                                 "Produk akan diarsipkan dan tidak akan ditampilkan di katalog."}
                           </p>
                        </div>
                     </div>

                     <div className="flex justify-end mt-6">
                        <button
                           type="button"
                           className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400 transition-colors"
                           onClick={handleCloseStatusModal}
                           disabled={isSaving}>
                           Batal
                        </button>
                        <button
                           type="submit"
                           className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                           disabled={isSaving}>
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
