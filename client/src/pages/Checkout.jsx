// Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserCart, clearCart } from "../service/api/cartService";
import { createOrder } from "../service/api/orderService";
import {
  createSnapToken,
  getPaymentStatus,
} from "../service/api/paymentService";
import { toast } from "react-hot-toast";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Inisialisasi Midtrans Snap
  useEffect(() => {
    const loadMidtransScript = () => {
      // Membuat elemen script untuk Midtrans
      const snapScript = document.createElement("script");
      snapScript.src =
        import.meta.env.VITE_MIDTRANS_SNAP_URL ||
        "https://app.sandbox.midtrans.com/snap/snap.js";
      snapScript.type = "text/javascript";
      snapScript.dataset.clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
      document.head.appendChild(snapScript);
    };

    loadMidtransScript();
  }, []);

  // Ambil data cart untuk ditampilkan pada checkout
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const data = await getUserCart();
        setCartItems(data.cart || []);
        if (!data.cart || data.cart.length === 0) {
          toast.error("Keranjang Anda kosong");
          navigate("/cart");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Gagal memuat data keranjang");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // Menghitung total
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const orderData = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: `${formData.get("address")}, ${formData.get(
          "city"
        )}, ${formData.get("postalCode")}`,
      };

      // Buat order melalui API
      const orderResponse = await createOrder(orderData);

      if (!orderResponse || !orderResponse.order) {
        throw new Error("Gagal membuat pesanan");
      }

      // Siapkan data untuk midtrans
      const midtransData = {
        order_id: orderResponse.order.id,
        gross_amount: total,
        customer_details: {
          first_name: orderData.name,
          phone: orderData.phone,
          billing_address: {
            address: orderData.address,
          },
        },
        item_details: cartItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: "Clothing",
        })),
      };

      // Dapatkan Snap Token
      const snapData = await createSnapToken(midtransData);

      if (snapData.status && snapData.token) {
        // Tampilkan Snap Payment
        window.snap.pay(snapData.token, {
          onSuccess: async function (result) {
            toast.success("Pembayaran berhasil!");
            await clearCart();
            navigate(`/payment/success/${orderResponse.order.id}`);
          },
          onPending: function (result) {
            toast.success(
              "Pembayaran dalam proses. Silakan selesaikan pembayaran Anda."
            );
            navigate(`/payment/pending/${orderResponse.order.id}`);
          },
          onError: function (result) {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            navigate(`/payment/failed/${orderResponse.order.id}`);
          },
          onClose: function () {
            toast.info("Jendela pembayaran ditutup. Pesanan Anda tersimpan.");
            // Periksa status pembayaran setelah jendela ditutup
            navigate(`/orders/${orderResponse.order.id}`);
          },
        });
      } else {
        toast.error("Gagal menginisialisasi pembayaran");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Gagal membuat pesanan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Informasi Pengiriman</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="phone">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="address">
                  Alamat
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="city">
                    Kota
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="postalCode"
                  >
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size || "Standard"}, Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    Rp. {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>Rp. {total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
