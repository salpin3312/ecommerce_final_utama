import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../service/api/orderService";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "../lib/lib";

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

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

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Menunggu_Konfirmasi":
        return <Package className="inline-block mr-2" size={18} />;
      case "Dikonfirmasi":
        return <Package className="inline-block mr-2" size={18} />;
      case "Dikirim":
        return <Truck className="inline-block mr-2" size={18} />;
      case "Sampai":
        return <CheckCircle className="inline-block mr-2" size={18} />;
      case "Dibatalkan":
        return <AlertTriangle className="inline-block mr-2" size={18} />;
      default:
        return <Package className="inline-block mr-2" size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold">Pesanan tidak ditemukan</h2>
            <p>Pesanan yang Anda cari tidak dapat ditemukan</p>
            <div className="card-actions justify-center mt-4">
              <Link to="/cart" className="btn btn-primary">
                <ArrowLeft size={18} className="mr-2" /> Kembali ke Keranjang
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/cart" className="btn btn-ghost btn-sm mr-4">
          <ArrowLeft size={18} /> Kembali
        </Link>
        <h2 className="text-3xl font-bold">Detail Pesanan #{order.id}</h2>
      </div>

      {/* Order Status */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Status Pesanan</h3>
              <div className={`badge ${getStatusBadgeColor(order.status)} p-3`}>
                {getStatusIcon(order.status)}
                {formatStatus(order.status)}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm">
                Tanggal Pesanan:{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              {order.updatedAt && (
                <p className="text-sm">
                  Terakhir Diperbarui:{" "}
                  {new Date(order.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar for Order Status */}
          {order.status !== "Dibatalkan" && (
            <div className="mt-8">
              <ul className="steps steps-vertical md:steps-horizontal w-full">
                <li className={`step ${order.status ? "step-primary" : ""}`}>
                  Pesanan Dibuat
                </li>
                <li
                  className={`step ${
                    order.status !== "Menunggu_Konfirmasi" ? "step-primary" : ""
                  }`}
                >
                  Dikonfirmasi
                </li>
                <li
                  className={`step ${
                    order.status === "Dikirim" || order.status === "Sampai"
                      ? "step-primary"
                      : ""
                  }`}
                >
                  Dikirim
                </li>
                <li
                  className={`step ${
                    order.status === "Sampai" ? "step-primary" : ""
                  }`}
                >
                  Sampai
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h3 className="text-xl font-bold mb-4">Item Pesanan</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Ukuran</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items &&
                  order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
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
                                onError={(e) => {
                                  e.target.src = `https://placehold.co/300x400?text=${item.product.name.charAt(
                                    0
                                  )}`;
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{item.product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.size || "Standard"}</td>
                      <td>{formatCurrency(item.product.price)}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {formatCurrency(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4">Informasi Pengiriman</h3>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Nama:</span>{" "}
                {order.name || order.user?.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {order.email || order.user?.email}
              </p>
              <p>
                <span className="font-semibold">Telepon:</span>{" "}
                {order.phone || "-"}
              </p>
              <p>
                <span className="font-semibold">Alamat:</span> {order.address}
              </p>
              {order.city && (
                <p>
                  <span className="font-semibold">Kota:</span> {order.city}
                </p>
              )}
              {order.postalCode && (
                <p>
                  <span className="font-semibold">Kode Pos:</span>{" "}
                  {order.postalCode}
                </p>
              )}
              {order.trackingNumber && (
                <p>
                  <span className="font-semibold">Nomor Tracking:</span>{" "}
                  {order.trackingNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4">Ringkasan Pembayaran</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal Produk:</span>
                <span>
                  {formatCurrency(order.totalPrice - (order.shippingCost || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman:</span>
                <span>
                  {order.shippingCost
                    ? formatCurrency(order.shippingCost)
                    : "Gratis"}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Diskon:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="divider my-1"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <span>{order.paymentMethod || "Transfer Bank"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Pembayaran:</span>
                <span className={order.isPaid ? "text-success" : "text-error"}>
                  {order.isPaid ? "Dibayar" : "Belum Dibayar"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end">
        {order.status === "Menunggu_Konfirmasi" && (
          <button className="btn btn-error mr-4">Batalkan Pesanan</button>
        )}
        {order.status === "Dikirim" && (
          <button className="btn btn-success mr-4">
            Konfirmasi Penerimaan
          </button>
        )}
        {order.status === "Sampai" && (
          <Link to={`/review/${orderId}`} className="btn btn-primary">
            Beri Ulasan
          </Link>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;
