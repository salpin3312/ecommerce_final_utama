import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../service/api/orderService";
import { toast } from "react-hot-toast";
import { Clock } from "lucide-react";

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

function PaymentPending() {
   const { orderId } = useParams();
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);

   const getPaymentInstruction = () => {
      if (!order?.transaction) return null;
      try {
         const payload = JSON.parse(order.transaction.paymentResponse || "{}");
         const paymentType = payload.payment_type || order.transaction.paymentType;
         const instruction = { paymentType, lines: [] };

         if (paymentType === "bank_transfer") {
            if (Array.isArray(payload.va_numbers) && payload.va_numbers.length > 0) {
               instruction.lines = payload.va_numbers.map((va) => ({
                  label: (va.bank || "Bank").toUpperCase(),
                  value: va.va_number,
               }));
            } else if (payload.permata_va_number) {
               instruction.lines = [{ label: "PERMATA", value: payload.permata_va_number }];
            } else if (payload.biller_code && payload.bill_key) {
               instruction.lines = [
                  { label: "Biller Code", value: payload.biller_code },
                  { label: "Bill Key", value: payload.bill_key },
               ];
            }
         } else if (paymentType === "echannel") {
            instruction.lines = [
               { label: "Biller Code", value: payload.biller_code },
               { label: "Bill Key", value: payload.bill_key },
            ];
         } else if (paymentType === "cstore") {
            instruction.lines = [{ label: (payload.store || "Toko").toUpperCase(), value: payload.payment_code }];
         }

         const expiry = payload.expiry_time ? new Date(payload.expiry_time) : null;
         return { ...instruction, expiry };
      } catch (e) {
         return null;
      }
   };

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
                     <p>Status: {order.status || "Menunggu Pembayaran"}</p>

                     {/* Total Price with Discount */}
                     {(() => {
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

                              return sum + finalPrice * quantity;
                           }, 0) + Number(order.shippingCost || 0);

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
                                       <span className="font-medium">
                                          {item.product?.name || item.name || "Produk"}
                                       </span>
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

                     {/* Payment code display */}
                     {order.transaction &&
                        order.transaction.transactionStatus === "pending" &&
                        (() => {
                           const info = getPaymentInstruction();
                           if (!info || !info.lines || info.lines.length === 0) return null;
                           return (
                              <div className="mt-4 p-3 rounded border bg-white">
                                 <div className="font-semibold mb-2">Kode Pembayaran</div>
                                 <div className="text-sm opacity-70 mb-2">Metode: {info.paymentType}</div>
                                 <div className="space-y-2">
                                    {info.lines.map((line, idx) => (
                                       <div key={idx} className="flex items-center justify-between gap-2">
                                          <div>
                                             <div className="text-xs uppercase opacity-70">{line.label}</div>
                                             <div className="font-mono text-base">{line.value}</div>
                                          </div>
                                          <button
                                             className="btn btn-xs"
                                             onClick={() => navigator.clipboard.writeText(String(line.value))}>
                                             Copy
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                                 <div className="text-xs opacity-70 mt-3">
                                    Batas waktu pembayaran:{" "}
                                    {info.expiry ? info.expiry.toLocaleString() : "24 jam sejak dibuat"}
                                 </div>
                              </div>
                           );
                        })()}
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
