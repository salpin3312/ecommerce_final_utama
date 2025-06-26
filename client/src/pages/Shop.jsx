import { useState, useEffect } from "react";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast for notifications
import ProductCard from "../components/Product-Card";
import { getAllProducts, searchProducts } from "../service/api/productService";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Hanya ambil produk dengan status ACTIVE
        const data = await getAllProducts({ status: "ACTIVE" });
        setProducts(data);
      } catch (error) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const result = await searchProducts(searchTerm);
      // Filter hasil pencarian untuk hanya menampilkan produk ACTIVE
      const activeProducts = result.products.filter(
        (product) => product.status === "ACTIVE"
      );
      setProducts(activeProducts);
    } catch (error) {
      toast.error("Error searching products");
      setError("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">T-Shirt Kami</h2>

      {/* Search form */}
      <form className="mb-8 flex gap-2" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          className="input input-bordered flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Cari
        </button>
      </form>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Shop;
