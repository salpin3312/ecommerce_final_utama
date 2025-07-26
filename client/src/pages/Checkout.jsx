// Checkout.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserCart, clearCart } from "../service/api/cartService";
import { createOrder } from "../service/api/orderService";
import {
  createSnapToken,
  getPaymentStatus,
} from "../service/api/paymentService";
import { getSession } from "../service/api/authService";
import { toast } from "react-hot-toast";
import {
  getShippingCost,
  getCities,
  getProvinces,
} from "../service/api/shippingService";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [originCityId] = useState("501"); // Example: Yogyakarta as origin (should be dynamic/configurable)
  const [destinationCityId, setDestinationCityId] = useState("");
  const [weight, setWeight] = useState(1000); // Default weight in grams (should sum cart items)
  const [courier, setCourier] = useState("");
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef(null);

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
        // Cek session terlebih dahulu
        const sessionData = await getSession();
        if (!sessionData.user) {
          toast.error("Anda harus login terlebih dahulu");
          navigate("/login");
          return;
        }

        console.log("User session:", sessionData.user);

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

  // Calculate total weight from cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const totalWeight = cartItems.reduce(
        (sum, item) => sum + (item.product.weight || 1000) * item.quantity,
        0
      );
      setWeight(totalWeight);
    }
  }, [cartItems]);

  // Fetch shipping options when destinationCityId, courier, or weight changes
  useEffect(() => {
    const fetchShipping = async () => {
      console.log("Shipping params:", {
        origin: originCityId,
        destination: destinationCityId,
        weight,
        courier,
      });

      if (originCityId && destinationCityId && weight > 0 && courier) {
        try {
          const res = await getShippingCost({
            origin: originCityId,
            destination: destinationCityId.toString(), // Convert to string
            weight,
            courier,
          });
          setShippingOptions(res.services || []);
        } catch (err) {
          console.error("Error fetching shipping options:", err);
          toast.error("Gagal memuat opsi pengiriman");
        }
      }
    };

    fetchShipping();
  }, [originCityId, destinationCityId, weight, courier]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provinceList = await getProvinces();
        setProvinces(provinceList);
      } catch (err) {
        toast.error("Gagal memuat daftar provinsi");
      }
    };
    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    const fetchCities = async () => {
      if (selectedProvince) {
        try {
          const cityList = await getCities(selectedProvince);
          setCities(cityList);
        } catch (err) {
          toast.error("Gagal memuat daftar kota");
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [selectedProvince]);

  // Update shipping cost when user selects a shipping service
  useEffect(() => {
    if (selectedShipping && selectedShipping.cost) {
      setShippingCost(selectedShipping.cost);
    } else {
      setShippingCost(0);
    }
  }, [selectedShipping]);

  // Untuk menampilkan suggestion kota saat mengetik
  const filteredCities = cityInput
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(cityInput.toLowerCase())
      )
    : [];

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

      // Bersihkan nomor telepon
      let phone = formData.get("phone");
      phone = phone.replace(/[^0-9]/g, ""); // Hapus semua karakter kecuali angka

      // Validasi nomor telepon
      if (phone.length < 10) {
        toast.error("Nomor telepon terlalu pendek. Minimal 10 digit.");
        setSubmitting(false);
        return;
      }

      if (phone.length > 15) {
        toast.error("Nomor telepon terlalu panjang. Maksimal 15 digit.");
        setSubmitting(false);
        return;
      }

      const orderData = {
        name: formData.get("name"),
        phone: phone, // Gunakan nomor telepon yang sudah dibersihkan
        address: `${formData.get("address")}, ${formData.get(
          "city"
        )}, ${formData.get("postalCode")}`,
        shipping: selectedShipping
          ? {
              service: selectedShipping.service,
              description: selectedShipping.description,
              cost: selectedShipping.cost,
              etd: selectedShipping.etd,
              courier,
            }
          : null,
      };

      // Buat order melalui API
      const orderResponse = await createOrder(orderData);

      if (!orderResponse || !orderResponse.order) {
        throw new Error("Gagal membuat pesanan");
      }

      // Siapkan data untuk midtrans
      const itemDetails = [
        ...cartItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          quantity: Number(item.quantity),
          category: "Clothing",
        })),
      ];
      if (selectedShipping) {
        itemDetails.push({
          id: "shipping",
          name: `Ongkir (${selectedShipping.service})`,
          price: Number(selectedShipping.cost),
          quantity: 1,
          category: "Shipping",
        });
      }

      const midtransData = {
        order_id: orderResponse.order.id,
        gross_amount: Number(total + shippingCost),
        customer_details: {
          first_name: orderData.name,
          phone: orderData.phone,
          billing_address: {
            address: orderData.address,
          },
        },
        item_details: itemDetails,
      };

      console.log("Sending data to Midtrans:", midtransData);

      // Dapatkan Snap Token
      const snapData = await createSnapToken(midtransData);

      if (snapData.status && snapData.token) {
        // Tampilkan Snap Payment
        window.snap.pay(snapData.token, {
          onSuccess: async function (result) {
            toast.success("Pembayaran berhasil!");
            await clearCart();
            navigate(`/payment/status/success/${orderResponse.order.id}`);
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
                  placeholder="Contoh: 08123456789 (hanya angka)"
                  pattern="[0-9]*"
                  maxLength="15"
                  required
                />
                <small className="text-gray-500">
                  Masukkan nomor telepon tanpa spasi atau karakter khusus
                </small>
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
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="province"
                  >
                    Provinsi
                  </label>
                  <select
                    id="province"
                    name="province"
                    className="w-full p-2 border rounded"
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setDestinationCityId(""); // Reset city when province changes
                      setCityInput(""); // Clear city input
                      setShowCitySuggestions(false);
                    }}
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="city">
                    Kota Tujuan
                  </label>
                  <div className="relative">
                    <input
                      id="city"
                      name="city"
                      className="w-full p-2 border rounded"
                      type="text"
                      autoComplete="off"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        setShowCitySuggestions(true);
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowCitySuggestions(false), 150)
                      }
                      placeholder="Ketik nama kota..."
                      ref={cityInputRef}
                      required
                    />
                    {showCitySuggestions && filteredCities.length > 0 && (
                      <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-y-auto rounded shadow mt-1">
                        {filteredCities.map((city) => (
                          <li
                            key={city.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => {
                              setCityInput(city.name);
                              setDestinationCityId(city.id.toString()); // Convert to string
                              setShowCitySuggestions(false);
                            }}
                          >
                            {city.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Hidden input to keep city_id for form submit */}
                  <input type="hidden" name="city" value={destinationCityId} />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="courier">
                    Kurir
                  </label>
                  <select
                    id="courier"
                    name="courier"
                    className="w-full p-2 border rounded"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    required
                  >
                    <option value="">Pilih Kurir</option>
                    <option value="jne">JNE</option>
                    <option value="tiki">TIKI</option>
                    <option value="pos">POS</option>
                  </select>
                </div>
              </div>

              {shippingOptions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Pilih Layanan Pengiriman
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedShipping ? selectedShipping.service : ""}
                    onChange={(e) => {
                      const selected = shippingOptions.find(
                        (opt) => opt.service === e.target.value
                      );
                      setSelectedShipping(selected);
                    }}
                    required
                  >
                    <option value="">Pilih Layanan</option>
                    {shippingOptions.map((opt) => (
                      <option
                        key={`${opt.code}-${opt.service}`}
                        value={opt.service}
                      >
                        {opt.name} - {opt.service} (Rp.{" "}
                        {opt.cost.toLocaleString()}, Estimasi:{" "}
                        {opt.etd || "TBD"} hari)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-between">
                <p>Ongkir</p>
                <p>Rp. {shippingCost.toLocaleString()}</p>
              </div>
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>Rp. {(total + shippingCost).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
