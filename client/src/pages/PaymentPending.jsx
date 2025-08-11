import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../service/api/orderService";
import { toast } from "react-hot-toast";
import { Clock } from "lucide-react";

function PaymentPending() {
   const { orderId } = useParams();
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchOrder = async () => {
         try {
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

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
               <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
               <h1 className="text-2xl font-bold mb-2 text-yellow-600">Pembayaran Dalam Proses</h1>
               <p className="text-gray-600 mb-6">
                  Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi yang diberikan.
               </p>

               {order && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                     <p className="font-medium">ID Pesanan: {order.id}</p>
                     <p>Total: Rp. {order.total?.toLocaleString() || "0"}</p>
                     <p>Status: {order.status || "Menunggu Pembayaran"}</p>
                  </div>
               )}

               <div className="space-y-3">
                  <Link to={`/orders/${orderId}`} className="btn btn-primary w-full">
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

export default PaymentPending;
