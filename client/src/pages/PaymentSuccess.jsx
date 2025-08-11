import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../service/api/orderService";
import { clearCart } from "../service/api/cartService";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";

function PaymentSuccess() {
   const { orderId } = useParams();
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchOrder = async () => {
         try {
            // Clear cart after successful payment
            await clearCart();

            const orderData = await getOrderById(orderId);
            setOrder(orderData.order);
         } catch (error) {
            console.error("Error fetching order:", error);
            toast.error("Gagal memuat data pesanan");
         } finally {
            setLoading(false);
         }
      };

      fetchOrder();
   }, [orderId]);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <div className="loading loading-spinner loading-lg"></div>
               <p className="mt-4">Memuat data pesanan...</p>
            </div>
         </div>
      );
   }

   if (!order) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <h1 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h1>
               <Link to="/" className="btn btn-primary">
                  Kembali ke Beranda
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
               <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
               <h1 className="text-2xl font-bold mb-2 text-green-600">Pembayaran Berhasil!</h1>
               <p className="text-gray-600 mb-6">Terima kasih atas pesanan Anda. Pembayaran telah berhasil diproses.</p>

               <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <p className="font-medium">ID Pesanan: {order.id}</p>
                  <p>Total: Rp. {order.totalPrice?.toLocaleString() || "0"}</p>
                  <p>Status: {order.status || "Sudah Dibayar"}</p>
               </div>

               <div className="space-y-3">
                  <Link to={`/orders/${order.id}`} className="btn btn-primary w-full">
                     Detail Pesanan
                  </Link>
                  <Link to="/cart" className="btn btn-outline w-full">
                     Lihat Semua Pesanan
                  </Link>
                  <Link to="/" className="btn btn-ghost w-full">
                     Kembali ke Beranda
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default PaymentSuccess;
