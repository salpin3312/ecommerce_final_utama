// PaymentStatus.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPaymentStatus } from "../service/api/paymentService";
import { getOrderById } from "../service/api/orderService";
import { toast } from "react-hot-toast";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";

function PaymentStatus() {
  const { status, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Dapatkan status pembayaran terbaru dari Midtrans
        await getPaymentStatus(orderId);

        // Ambil data order yang sudah diupdate
        const orderData = await getOrderById(orderId);
        setOrder(orderData.order);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h1>
          <p className="mb-4">
            Maaf, kami tidak dapat menemukan pesanan dengan ID tersebut.
          </p>
          <Link to="/orders" className="btn btn-primary">
            Lihat Semua Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const renderStatusContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
            <p className="mb-4">
              Terima kasih atas pesanan Anda. Pembayaran telah berhasil
              diproses.
            </p>
          </>
        );
      case "pending":
        return (
          <>
            <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Pembayaran Dalam Proses</h1>
            <p className="mb-4">
              Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran
              sesuai instruksi.
            </p>
          </>
        );
      case "failed":
        return (
          <>
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
            <p className="mb-4">
              Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi.
            </p>
          </>
        );
      default:
        return (
          <>
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Status Pembayaran</h1>
            <p className="mb-4">
              Berikut adalah status pembayaran untuk pesanan Anda.
            </p>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        {renderStatusContent()}

        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p className="font-medium">ID Pesanan: {order.id}</p>
          <p>Total: Rp. {order.total?.toLocaleString() || "0"}</p>
          <p>Status Pembayaran: {order.paymentStatus || "Belum dibayar"}</p>
        </div>

        <div className="flex justify-center gap-4">
          <Link to={`/orders/${order.id}`} className="btn btn-primary">
            Detail Pesanan
          </Link>
          <Link to="/orders" className="btn btn-outline">
            Semua Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentStatus;
