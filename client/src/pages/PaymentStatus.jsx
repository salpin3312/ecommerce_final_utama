// PaymentStatus.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const statusCode = searchParams.get("status_code");
    const transactionStatus = searchParams.get("transaction_status");

    console.log("Payment Status:", { orderId, statusCode, transactionStatus });

    if (!orderId) {
      toast.error("Order ID tidak ditemukan");
      navigate("/");
      return;
    }

    // Handle different payment statuses
    if (statusCode === "200" && transactionStatus === "settlement") {
      toast.success("Pembayaran berhasil!");
      // Clear cart and redirect to success page
      setTimeout(() => {
        navigate(`/payment/success/${orderId}`);
      }, 2000);
    } else if (transactionStatus === "pending") {
      toast.info(
        "Pembayaran dalam proses. Silakan selesaikan pembayaran Anda."
      );
      setTimeout(() => {
        navigate(`/payment/pending/${orderId}`);
      }, 2000);
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      toast.error("Pembayaran gagal atau dibatalkan.");
      setTimeout(() => {
        navigate(`/payment/failed/${orderId}`);
      }, 2000);
    } else {
      toast.error("Status pembayaran tidak diketahui.");
      setTimeout(() => {
        navigate(`/payment/failed/${orderId}`);
      }, 2000);
    }

    setLoading(false);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Memproses status pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">Memproses pembayaran...</p>
      </div>
    </div>
  );
}

export default PaymentStatus;
