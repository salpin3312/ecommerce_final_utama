import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { getProductById } from "../service/api/productService";
import { addToCart } from "../service/api/cartService";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../lib/lib";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data.product);
        // Set default selected size if available
        if (data.product?.sizes?.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        } else if (data.product?.size?.length > 0) {
          setSelectedSize(data.product.size[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    // Check if size selection is required
    const sizesArray = product.sizes || product.size || [];
    const hasSizes = Array.isArray(sizesArray) && sizesArray.length > 0;

    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedSize, quantity);
      toast.success("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to add to cart. Please try again."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle quantity changes
  const updateQuantity = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl mb-4">Product not found</p>
        <Link to="/products" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  // Determine which sizes array to use
  const sizesArray = product.sizes || product.size || [];
  const hasSizes = Array.isArray(sizesArray) && sizesArray.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="btn btn-ghost mb-4">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          {product.imageUrl ? (
            <img
              src={`${
                import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
                "http://localhost:8000"
              }${product.imageUrl}`}
              alt={product.name}
              className="w-full rounded-lg object-cover"
              onError={(e) => {
                e.target.src = `https://placehold.co/600x400?text=${product.name.charAt(
                  0
                )}`;
              }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500 text-5xl">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4">
            {formatCurrency(product.price)}
          </p>

          <div className="divider"></div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              {product.description || "No description available."}
            </p>
          </div>

          {hasSizes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {sizesArray.map((size) => (
                  <button
                    key={size}
                    className={`btn ${
                      selectedSize === size ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Quantity</h3>
            <div className="join">
              <button
                className="btn join-item"
                onClick={() => updateQuantity(quantity - 1)}
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    updateQuantity(value);
                  }
                }}
                className="input join-item w-16 text-center"
              />
              <button
                className="btn join-item"
                onClick={() => updateQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
