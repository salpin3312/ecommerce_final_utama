import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../service/api/orderService";
import { clearCart } from "../service/api/cartService";
import { toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";

// Helper function untuk format currency Indonesia
const formatCurrency = (amount) => {
   return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   })
      .format(amount)
      .replace("IDR", "Rp.");
};

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
                  <p>Status: {order.status || "Sudah Dibayar"}</p>

                  {/* Total Price with Discount */}
                  {(() => {
                     // Debug: Log struktur data untuk memahami format
                     console.log("Order data:", order);
                     console.log("Order items:", order.orderItems);

                     // Hitung total dengan diskon - pendekatan yang lebih sederhana
                     const totalWithDiscount =
                        (order.orderItems || []).reduce((sum, item) => {
                           // Ambil harga dasar
                           const basePrice = Number(item.price) || 0;
                           const quantity = Number(item.quantity) || 1;

                           // Cek apakah ada diskon
                           let finalPrice = basePrice;

                           // Jika ada discountedPrice langsung, gunakan itu
                           if (item.product?.discountedPrice) {
                              finalPrice = Number(item.product.discountedPrice);
                           } else if (item.discountedPrice) {
                              finalPrice = Number(item.discountedPrice);
                           }
                           // Jika ada discount percentage, hitung manual
                           else if (item.product?.discountPercentage > 0) {
                              const originalPrice = Number(item.product.price) || basePrice;
                              finalPrice = originalPrice * (1 - Number(item.product.discountPercentage) / 100);
                           } else if (item.discountPercentage > 0) {
                              finalPrice = basePrice * (1 - Number(item.discountPercentage) / 100);
                           }

                           console.log(
                              `Item: ${
                                 item.product?.name || item.name
                              }, Base: ${basePrice}, Final: ${finalPrice}, Qty: ${quantity}, Subtotal: ${
                                 finalPrice * quantity
                              }`
                           );

                           return sum + finalPrice * quantity;
                        }, 0) + Number(order.shippingCost || 0);

                     console.log("Final total:", totalWithDiscount);

                     return (
                        <div className="mt-3">
                           <p className="text-lg font-bold">Total: {formatCurrency(totalWithDiscount)}</p>
                        </div>
                     );
                  })()}

                  {/* Order Items with Discount */}
                  {(order.orderItems || []).length > 0 && (
                     <div className="mt-4">
                        <p className="font-medium text-sm mb-2">Item Pesanan:</p>
                        <div className="space-y-2">
                           {(order.orderItems || []).map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                 <div>
                                    <span className="font-medium">{item.product?.name || item.name || "Produk"}</span>
                                    {(item.product?.hasActiveDiscount ||
                                       item.product?.discountPercentage > 0 ||
                                       item.discountPercentage > 0) && (
                                       <span className="ml-2 text-xs text-green-600 font-medium">
                                          🔥 -{item.product?.discountPercentage || item.discountPercentage || 0}%
                                       </span>
                                    )}
                                 </div>
                                 <div className="text-right">
                                    {(() => {
                                       // Hitung harga final untuk item ini
                                       const basePrice = Number(item.price) || 0;
                                       const quantity = Number(item.quantity) || 1;

                                       let finalPrice = basePrice;

                                       // Jika ada discountedPrice langsung, gunakan itu
                                       if (item.product?.discountedPrice) {
                                          finalPrice = Number(item.product.discountedPrice);
                                       } else if (item.discountedPrice) {
                                          finalPrice = Number(item.discountedPrice);
                                       }
                                       // Jika ada discount percentage, hitung manual
                                       else if (item.product?.discountPercentage > 0) {
                                          const originalPrice = Number(item.product.price) || basePrice;
                                          finalPrice =
                                             originalPrice * (1 - Number(item.product.discountPercentage) / 100);
                                       } else if (item.discountPercentage > 0) {
                                          finalPrice = basePrice * (1 - Number(item.discountPercentage) / 100);
                                       }

                                       return <span>{formatCurrency(finalPrice * quantity)}</span>;
                                    })()}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
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
