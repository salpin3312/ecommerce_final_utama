import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { getAllOrders, updateOrderStatus } from "../../service/api/orderService";
import { formatCurrency } from "../../lib/lib";

function Orders() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStatus, setFilterStatus] = useState(null);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [showModal, setShowModal] = useState(false);

   // Fetch orders when component mounts
   useEffect(() => {
      fetchOrders();
   }, [filterStatus]);

   // Fetch orders function
   const fetchOrders = async () => {
      try {
         setLoading(true);
         const response = await getAllOrders(filterStatus);
         console.log(response);
         setOrders(response.orders || []);
         setError(null);
      } catch (err) {
         console.error("Error fetching orders:", err);
         setError("Failed to load orders. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   // Update order status
   const handleStatusChange = async (orderId, newStatus) => {
      try {
         const prev = orders.find((o) => o.id === orderId)?.status;
         await updateOrderStatus(orderId, newStatus);
         // Update local state to avoid refetching
         setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
         );
         // Notify sidebar to update badge
         window.dispatchEvent(
            new CustomEvent("orderStatusChanged", { detail: { orderId, fromStatus: prev, toStatus: newStatus } })
         );
      } catch (err) {
         console.error("Error updating order status:", err);
         alert("Failed to update order status. Please try again.");
      }
   };

   const getStatusBadgeColor = (status) => {
      const colors = {
         Menunggu_Konfirmasi: "bg-yellow-100 text-yellow-800",
         Dikonfirmasi: "bg-blue-100 text-blue-800",
         Dikirim: "bg-green-100 text-green-800",
         Sampai: "bg-purple-100 text-purple-800",
         Dibatalkan: "bg-red-100 text-red-800",
      };
      return colors[status] || "bg-gray-100 text-gray-800";
   };

   const getPaymentBadge = (order) => {
      const tx = order?.transaction?.transactionStatus;
      if (tx === "settlement" || tx === "capture")
         return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
               Sudah Dibayar
            </span>
         );
      if (tx === "pending" || !tx)
         return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
               Belum Dibayar
            </span>
         );
      if (["deny", "cancel", "expire"].includes(tx))
         return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
               Dibatalkan
            </span>
         );
      return (
         <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {tx}
         </span>
      );
   };

   const openDetail = (order) => {
      setSelectedOrder(order);
      setShowModal(true);
   };
   const closeDetail = () => {
      setShowModal(false);
      setSelectedOrder(null);
   };

   const filteredOrders = orders.filter(
      (order) =>
         order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.id.toString().includes(searchTerm)
   );

   // Sort orders by createdAt descending (newest first)
   const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   const canConfirm = (order) => order.status === "Menunggu_Konfirmasi";

   const handleQuickConfirm = async (orderId) => {
      try {
         await updateOrderStatus(orderId, "Dikonfirmasi");
         setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "Dikonfirmasi" } : o)));
         // Notify sidebar to update badge immediately
         const prev = orders.find((o) => o.id === orderId)?.status || "Menunggu_Konfirmasi";
         window.dispatchEvent(
            new CustomEvent("orderStatusChanged", { detail: { orderId, fromStatus: prev, toStatus: "Dikonfirmasi" } })
         );
      } catch (err) {
         console.error("Confirm failed", err);
         alert("Gagal mengkonfirmasi pesanan");
      }
   };

   return (
      <div>
         <h1 className="text-3xl font-semibold mb-6">Orders</h1>

         <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
               <div className="relative">
                  <input
                     type="text"
                     placeholder="Cari pesanan..."
                     className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
               </div>
               <div className="flex items-center gap-3">
                  <select
                     className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={filterStatus || ""}
                     onChange={(e) => setFilterStatus(e.target.value || null)}>
                     <option value="">Semua Status</option>
                     <option value="Menunggu_Konfirmasi">Menunggu Konfirmasi</option>
                     <option value="Dikonfirmasi">Dikonfirmasi</option>
                     <option value="Dikirim">Dikirim</option>
                     <option value="Sampai">Sampai</option>
                     <option value="Dibatalkan">Dibatalkan</option>
                  </select>
               </div>
            </div>

            {loading ? (
               <div className="text-center py-8">
                  <p>Loading orders...</p>
               </div>
            ) : error ? (
               <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
               </div>
            ) : filteredOrders.length === 0 ? (
               <div className="text-center py-8">
                  <p>No orders found.</p>
               </div>
            ) : (
               <div className="max-h-[80vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {sortedOrders.map((order, idx) => (
                        <div
                           key={order.id}
                           className="border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white p-4 h-64 flex flex-col cursor-pointer"
                           onClick={() => openDetail(order)}>
                           <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start gap-2">
                                 <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0">
                                    {idx + 1}
                                 </div>
                                 <div>
                                    <div className="text-xs text-gray-500">#{order.id}</div>
                                    <div className="text-sm font-semibold">{order.customer || order.name}</div>
                                    {order.user?.email && (
                                       <div className="text-xs text-gray-500">{order.user.email}</div>
                                    )}
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                 <span
                                    className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                       order.status
                                    )}`}>
                                    {order.status.replace("_", " ")}
                                 </span>
                                 {getPaymentBadge(order)}
                              </div>
                           </div>

                           <div className="mt-2 text-sm text-gray-600 flex-1">
                              <div className="flex justify-between">
                                 <span>Date</span>
                                 <span>{new Date(order.createdAt || order.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span>Total</span>
                                 <span className="font-semibold">{formatCurrency(order.totalPrice)}</span>
                              </div>
                           </div>

                           <div
                              className="mt-3 flex items-center justify-between gap-2"
                              onClick={(e) => e.stopPropagation()}>
                              <select
                                 className="border rounded-lg px-2 py-1 text-xs flex-1"
                                 value={order.status}
                                 onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                                 <option value="Menunggu_Konfirmasi">Menunggu Konfirmasi</option>
                                 <option value="Dikonfirmasi">Dikonfirmasi</option>
                                 <option value="Dikirim">Dikirim</option>
                                 <option value="Sampai">Sampai</option>
                                 <option value="Dibatalkan">Dibatalkan</option>
                              </select>
                              <button
                                 className="btn btn-primary btn-sm"
                                 disabled={!canConfirm(order)}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickConfirm(order.id);
                                 }}>
                                 ACC
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* Detail Modal */}
         {showModal && selectedOrder && (
            <div className="modal modal-open">
               <div className="modal-box max-w-3xl">
                  <h3 className="font-bold text-lg mb-2">Detail Pesanan #{selectedOrder.id}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div className="space-y-2">
                        <div>
                           <div className="text-xs text-gray-500">Nama</div>
                           <div className="font-medium">{selectedOrder.name}</div>
                        </div>
                        {selectedOrder.user?.email && (
                           <div>
                              <div className="text-xs text-gray-500">Email</div>
                              <div className="font-medium break-all">{selectedOrder.user.email}</div>
                           </div>
                        )}
                        <div>
                           <div className="text-xs text-gray-500">Telepon</div>
                           <div className="font-medium">{selectedOrder.phone}</div>
                        </div>
                        <div>
                           <div className="text-xs text-gray-500">Alamat</div>
                           <div className="font-medium whitespace-pre-wrap break-words">{selectedOrder.address}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           <div>
                              <div className="text-xs text-gray-500">Kurir</div>
                              <div className="font-medium uppercase">{selectedOrder.courier || "-"}</div>
                           </div>
                           <div>
                              <div className="text-xs text-gray-500">Layanan</div>
                              <div className="font-medium">{selectedOrder.shippingService || "-"}</div>
                           </div>
                           <div>
                              <div className="text-xs text-gray-500">Estimasi</div>
                              <div className="font-medium">{selectedOrder.etd || "-"}</div>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div>
                           <div className="text-xs text-gray-500">Tanggal</div>
                           <div className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                 selectedOrder.status
                              )}`}>
                              {selectedOrder.status.replace("_", " ")}
                           </span>
                           {getPaymentBadge(selectedOrder)}
                        </div>
                     </div>
                  </div>

                  <div className="divider"></div>

                  <div className="max-h-60 overflow-y-auto">
                     <table className="table table-sm w-full">
                        <thead>
                           <tr>
                              <th>Produk</th>
                              <th>Qty</th>
                              <th>Harga</th>
                              <th>Subtotal</th>
                           </tr>
                        </thead>
                        <tbody>
                           {(selectedOrder.orderItems || []).map((it) => (
                              <tr key={it.id}>
                                 <td>{it.product?.name || "-"}</td>
                                 <td>{it.quantity}</td>
                                 <td>{formatCurrency(it.price)}</td>
                                 <td>{formatCurrency(Number(it.price) * Number(it.quantity))}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="mt-4 flex justify-end">
                     <div className="text-right w-full md:w-auto">
                        <div className="flex justify-between gap-8 text-sm text-gray-600">
                           <span>Subtotal Produk</span>
                           <span className="font-medium">
                              {formatCurrency(
                                 (selectedOrder.orderItems || []).reduce(
                                    (sum, it) => sum + Number(it.price) * Number(it.quantity),
                                    0
                                 )
                              )}
                           </span>
                        </div>
                        <div className="flex justify-between gap-8 text-sm text-gray-600">
                           <span>Ongkir</span>
                           <span className="font-medium">
                              {formatCurrency(Number(selectedOrder.shippingCost || 0))}
                           </span>
                        </div>
                        <div className="divider my-2"></div>
                        <div className="flex justify-between gap-8 text-lg font-bold">
                           <span>Total</span>
                           <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                        </div>
                     </div>
                  </div>

                  <div className="modal-action">
                     <button className="btn" onClick={closeDetail}>
                        Tutup
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default Orders;
