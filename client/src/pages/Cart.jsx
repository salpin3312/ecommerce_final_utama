import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUserCart,
  updateCartItem,
  removeFromCart,
} from "../service/api/cartService";
import { getUserOrders, getOrderById } from "../service/api/orderService"; // Updated import
import { toast } from "react-hot-toast";
import { Trash2, ShoppingBag, CheckCircle, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../lib/lib";

function Cart() {
  const [activeTab, setActiveTab] = useState("cart");
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]); // For checkout history
  const [loading, setLoading] = useState(false);

  // Fetch data when the page loads or tab changes
  useEffect(() => {
    if (activeTab === "cart") {
      fetchCart();
    } else if (activeTab === "orders") {
      fetchActiveOrders();
    } else if (activeTab === "checkout-history") {
      fetchCompletedOrders();
    }
  }, [activeTab]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getUserCart();
      setCartItems(data.cart || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    setLoading(true);
    try {
      const data = await getUserOrders();
      console.log(data);
      // Filter for active orders (not completed or cancelled)
      const activeOrders = data.orders.filter(
        (order) => order.status !== "Selesai" && order.status !== "Dibatalkan"
      );
      setOrders(activeOrders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      const data = await getUserOrders();
      // Filter for completed orders
      const completed = data.orders.filter(
        (order) => order.status === "Sampai" || order.status === "Dibatalkan"
      );
      setCompletedOrders(completed || []);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (cartId, newQuantity, size) => {
    if (newQuantity < 1) return;

    try {
      const updatedItem = await updateCartItem(cartId, newQuantity, size);
      setCartItems((prevCart) =>
        prevCart.map((item) =>
          item.id === cartId
            ? {
                ...item,
                quantity: updatedItem.quantity,
                size: updatedItem.size || item.size,
              }
            : item
        )
      );
      toast.success("Cart updated!");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (cartId) => {
    try {
      await removeFromCart(cartId);
      setCartItems((prevCart) => prevCart.filter((item) => item.id !== cartId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  // Calculate total price
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Menunggu_Konfirmasi":
        return "badge-warning";
      case "Dikonfirmasi":
        return "badge-info";
      case "Dikirim":
        return "badge-primary";
      case "Sampai":
        return "badge-success";
      case "Dibatalkan":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  // Helper function to format status text
  const formatStatus = (status) => {
    return status.replace(/_/g, " ");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Belanjaan Kalian</h2>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === "cart" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("cart")}
        >
          <ShoppingCart size={18} className="mr-2" /> Keranjang
        </a>
        <a
          className={`tab ${activeTab === "orders" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <ShoppingBag size={18} className="mr-2" /> Pesanan Anda
        </a>
        <a
          className={`tab ${
            activeTab === "checkout-history" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("checkout-history")}
        >
          <CheckCircle size={18} className="mr-2" /> Riwayat Pesanan
        </a>
      </div>

      {/* Cart Tab Content */}
      {activeTab === "cart" && (
        <>
          {loading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4">Keranjang kamu kosong</p>
              <Link to="/shop" className="btn btn-primary">
                Yuk Lanjut Belanja 🎉
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="card card-side bg-base-100 shadow-xl mb-4"
                  >
                    <figure className="w-32">
                      <img
                        src={
                          item.product.imageUrl
                            ? `${
                                import.meta.env.VITE_API_URL?.replace(
                                  /\/api$/,
                                  ""
                                ) || "http://localhost:8000"
                              }${item.product.imageUrl}`
                            : "https://placehold.co/300x400"
                        }
                        alt={item.product.name}
                        className="object-cover h-full"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/300x400?text=${item.product.name.charAt(
                            0
                          )}`;
                        }}
                      />
                    </figure>
                    <div className="card-body">
                      <h2 className="card-title">{item.product.name}</h2>
                      <p>{formatCurrency(item.product.price)}</p>
                      <p>Size: {item.size || "Standard"}</p>
                      <div className="flex items-center gap-4">
                        <div className="join">
                          <button
                            className="btn join-item"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.size
                              )
                            }
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            className="input join-item w-16 text-center"
                            readOnly
                          />
                          <button
                            className="btn join-item"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.size
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="btn btn-circle btn-sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card bg-base-100 shadow-xl h-fit p-6 lg:w-80">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Shipping:</span>
                  <span>Gratis</span>
                </div>
                <div className="divider"></div>
                <div className="flex justify-between mb-4 text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* Orders Tab Content */}
      {activeTab === "orders" && (
        <>
          {loading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4">Kamu belum memiliki pesanan.</p>
              <Link to="/shop" className="btn btn-primary">
                Yuk Pergi Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <h3 className="card-title">Pesanan #{order.id}</h3>
                      <div
                        className={`badge ${getStatusBadgeColor(
                          order.status
                        )} `}
                      >
                        <p>{formatStatus(order.status)}</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      Pesanan dibuat:{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="divider"></div>

                    <div className="grid gap-2">
                      {order.items &&
                        order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 items-center"
                          >
                            <div className="flex-grow">
                              <p className="font-semibold">
                                {item.product.name}
                              </p>
                              <p className="text-sm">
                                {item.quantity} × Rp.{" "}
                                {item.product.price.toLocaleString()}
                                {item.size && ` - Size: ${item.size}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                Rp.{" "}
                                {(
                                  item.product.price * item.quantity
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="divider"></div>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Pengiriman:</p>
                        <p className="text-sm">{order.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Total:</p>
                        <p className="font-bold">
                          {formatCurrency(order.totalPrice.toLocaleString())}
                        </p>
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      {order.status === "Menunggu_Konfirmasi" && (
                        <button className="btn btn-error btn-outline">
                          Batalkan
                        </button>
                      )}
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn btn-primary"
                      >
                        Lihat Pesanan
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Checkout History Tab Content */}
      {activeTab === "checkout-history" && (
        <>
          {loading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4">
                Kamu Belum pernah melakukan checkout.
              </p>
              <Link to="/shop" className="btn btn-primary">
                Yuk pergi belanja sekarang
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{orders.length}</td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td>
                        <div
                          className={`badge ${getStatusBadgeColor(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn btn-xs btn-outline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cart;
