import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, cancelOrder } from "../service/api/orderService"; // Added cancelOrder import
import { toast } from "react-hot-toast";
import { ArrowLeft, Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../lib/lib";
import { getPaymentStatus as getPaymentStatusApi } from "../service/api/paymentService";

function OrderDetail() {
   const { orderId } = useParams();
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);
   const [checkingPayment, setCheckingPayment] = useState(false);
   const [showCancelModal, setShowCancelModal] = useState(false);

   const ASSET_BASE_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
      : "http://localhost:8000";
   const getProductImageUrl = (url) => {
      if (!url) return null;
      if (/^https?:\/\//.test(url)) return url;
      return `${ASSET_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
   };

   useEffect(() => {
      fetchOrderDetails();
      // eslint-disable-next-line
   }, [orderId]);

   useEffect(() => {
      // Auto-poll payment status while still pending/menunggu konfirmasi
      if (!order) return;
      const isPendingPayment =
         (order.transaction && order.transaction.transactionStatus === "pending") ||
         order.status === "Menunggu_Konfirmasi";

      if (!isPendingPayment) return;

      const intervalId = setInterval(async () => {
         try {
            await getPaymentStatusApi(order.id);
            await fetchOrderDetails();
         } catch (_) {
            // silent fail
         }
      }, 15000); // 15s

      return () => clearInterval(intervalId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [order?.id, order?.status, order?.transaction?.transactionStatus]);

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

   const handleCheckPayment = async () => {
      setCheckingPayment(true);
      try {
         await getPaymentStatusApi(order.id); // Trigger backend untuk update status transaksi & order
         await fetchOrderDetails(); // Refresh data order
         toast.success("Status pembayaran diperbarui!");
      } catch (err) {
         toast.error("Gagal cek status pembayaran");
      } finally {
         setCheckingPayment(false);
      }
   };

   // Cancel order function
   const handleCancelOrder = async () => {
      // Show modal for confirmation
      setShowCancelModal(true);
   };

   // Confirm cancel order
   const confirmCancelOrder = async () => {
      try {
         await cancelOrder(order.id);
         toast.success("Pesanan berhasil dibatalkan");
         // Refresh order details
         await fetchOrderDetails();
      } catch (error) {
         console.error("Error canceling order:", error);
         toast.error("Gagal membatalkan pesanan");
      } finally {
         setShowCancelModal(false);
      }
   };

   // Close cancel modal
   const closeCancelModal = () => {
      setShowCancelModal(false);
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
      return status ? status.replace(/_/g, " ") : "-";
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

   // Helper function to get payment status text and color
   const getPaymentStatusDisplay = () => {
      if (order.transaction && order.transaction.transactionStatus) {
         const status = order.transaction.transactionStatus;
         if (status === "settlement" || status === "capture") {
            return { text: "Sudah Dibayar", color: "text-success" };
         } else if (status === "pending") {
            return { text: "Belum Dibayar", color: "text-warning" };
         } else if (["cancel", "deny", "expire"].includes(status)) {
            return { text: "Dibatalkan", color: "text-error" };
         } else {
            return { text: status, color: "text-gray-500" };
         }
      } else {
         // fallback logic - Menunggu_Konfirmasi berarti belum dibayar karena menunggu konfirmasi admin
         if (order.status === "Menunggu_Konfirmasi") {
            return { text: "Belum Dibayar", color: "text-warning" };
         } else if (["Dikonfirmasi", "Dikirim", "Sampai"].includes(order.status)) {
            return { text: "Sudah Dibayar", color: "text-success" };
         } else if (order.status === "Dibatalkan") {
            return { text: "Dibatalkan", color: "text-error" };
         } else {
            return { text: "Belum Dibayar", color: "text-warning" };
         }
      }
   };

   // Parse payment code/VA from Midtrans response stored in transaction
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
               // Mandiri via echannel sometimes returned here
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
         } else if (paymentType === "qris") {
            // Show reference if available
            if (payload.acquirer && payload.acquirer === "gopay") {
               instruction.lines = [{ label: "QRIS", value: "Scan QR pada aplikasi e-wallet Anda" }];
            }
         }

         // Expiry time if provided
         const expiry = payload.expiry_time ? new Date(payload.expiry_time) : null;
         return { ...instruction, expiry };
      } catch (e) {
         return null;
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

   // Hitung subtotal produk
   const subtotal =
      (order.orderItems || []).reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0) || 0;

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
                        Tanggal Pesanan: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                     </p>
                     {order.updatedAt && (
                        <p className="text-sm">Terakhir Diperbarui: {new Date(order.updatedAt).toLocaleDateString()}</p>
                     )}
                  </div>
               </div>

               {/* Progress Bar for Order Status */}
               {order.status !== "Dibatalkan" && (
                  <div className="mt-8">
                     <ul className="steps steps-vertical md:steps-horizontal w-full">
                        <li className={`step step-primary`}>Pesanan Dibuat</li>
                        <li className={`step ${order.status !== "Menunggu_Konfirmasi" ? "step-primary" : ""}`}>
                           Dikonfirmasi
                        </li>
                        <li
                           className={`step ${
                              order.status === "Dikirim" || order.status === "Sampai" ? "step-primary" : ""
                           }`}>
                           Dikirim
                        </li>
                        <li className={`step ${order.status === "Sampai" ? "step-primary" : ""}`}>Sampai</li>
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
                           <th>Harga</th>
                           <th>Jumlah</th>
                           <th>Subtotal</th>
                        </tr>
                     </thead>
                     <tbody>
                        {(order.orderItems || []).map((item) => (
                           <tr key={item.id}>
                              <td>
                                 <div className="flex items-center space-x-3">
                                    <div className="avatar">
                                       <div className="mask mask-squircle w-12 h-12">
                                          <img
                                             src={
                                                getProductImageUrl(item.product?.imageUrl) ||
                                                "https://placehold.co/300x400"
                                             }
                                             alt={item.product?.name || "Produk"}
                                             loading="lazy"
                                             onError={(e) => {
                                                e.target.src = `https://placehold.co/300x400?text=${
                                                   item.product?.name?.charAt(0) || "P"
                                                }`;
                                             }}
                                          />
                                       </div>
                                    </div>
                                    <div>
                                       <div className="font-bold">{item.product?.name || "-"}</div>
                                    </div>
                                 </div>
                              </td>
                              <td>{formatCurrency(item.price)}</td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(Number(item.price) * Number(item.quantity))}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Shipping & Payment Information */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-xl">
               <div className="card-body">
                  <h3 className="text-xl font-bold mb-4">Informasi Pengiriman</h3>
                  <div className="space-y-2">
                     <p>
                        <span className="font-semibold">Nama:</span> {order.name}
                     </p>
                     <p>
                        <span className="font-semibold">Email:</span> {order.user?.email || "-"}
                     </p>
                     <p>
                        <span className="font-semibold">Telepon:</span> {order.phone}
                     </p>
                     <p>
                        <span className="font-semibold">Alamat:</span> {order.address}
                     </p>
                     <p>
                        <span className="font-semibold">Kurir:</span> {order.courier?.toUpperCase() || "-"}
                     </p>
                     <p>
                        <span className="font-semibold">Layanan:</span> {order.shippingService || "-"}
                     </p>
                     <p>
                        <span className="font-semibold">Estimasi:</span> {order.etd || "-"}
                     </p>
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
                        <span>{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Biaya Pengiriman:</span>
                        <span>{order.shippingCost ? formatCurrency(order.shippingCost) : "Gratis"}</span>
                     </div>
                     <div className="divider my-1"></div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(order.totalPrice)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Status Pembayaran:</span>
                        <span className={getPaymentStatusDisplay().color}>{getPaymentStatusDisplay().text}</span>
                        <button
                           className="btn btn-xs btn-outline ml-2"
                           onClick={handleCheckPayment}
                           disabled={checkingPayment}>
                           {checkingPayment ? "Mengecek..." : "Cek Status Pembayaran"}
                        </button>
                     </div>

                     {/* Payment Code / VA for pending payments */}
                     {order.transaction &&
                        order.transaction.transactionStatus === "pending" &&
                        (() => {
                           const info = getPaymentInstruction();
                           if (!info || !info.lines || info.lines.length === 0) return null;
                           return (
                              <div className="mt-4 p-3 rounded border bg-base-200">
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
               </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="mt-8 flex justify-end gap-2">
            {order.status === "Menunggu_Konfirmasi" &&
               !(order.transaction && ["settlement", "capture"].includes(order.transaction.transactionStatus)) && (
                  <button className="btn btn-error" onClick={handleCancelOrder}>
                     Batalkan Pesanan
                  </button>
               )}
            {order.status === "Dikirim" && <button className="btn btn-success">Konfirmasi Penerimaan</button>}
         </div>

         {/* Cancel Order Modal */}
         {showCancelModal && (
            <div className="modal modal-open">
               <div className="modal-box">
                  <div className="flex items-center gap-3 mb-4">
                     <AlertTriangle className="text-warning" size={24} />
                     <h3 className="font-bold text-lg">Konfirmasi Pembatalan</h3>
                  </div>
                  <p className="py-4">
                     Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="modal-action">
                     <button className="btn btn-ghost" onClick={closeCancelModal}>
                        Batal
                     </button>
                     <button className="btn btn-error" onClick={confirmCancelOrder}>
                        Ya, Batalkan Pesanan
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default OrderDetail;
