import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../service/api/orderService";
import { toast } from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

function PaymentFailed() {
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
               <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
               <h1 className="text-2xl font-bold mb-2 text-red-600">Pembayaran Gagal</h1>
               <p className="text-gray-600 mb-6">
                  Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau pilih metode pembayaran lain.
               </p>

               {order && (
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                     <p className="font-medium">ID Pesanan: {order.id}</p>
                     <p>Total: Rp. {order.total?.toLocaleString() || "0"}</p>
                     <p>Status: {order.status || "Gagal"}</p>
                  </div>
               )}

               <div className="space-y-3">
                  <Link to="/checkout" className="btn btn-primary w-full">
                     Coba Lagi
                  </Link>
                  <Link to="/cart" className="btn btn-outline w-full">
                     Kembali ke Keranjang
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

export default PaymentFailed;
