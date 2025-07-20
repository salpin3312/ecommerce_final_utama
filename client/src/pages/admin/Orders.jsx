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
         await updateOrderStatus(orderId, newStatus);
         // Update local state to avoid refetching
         setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
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

   const filteredOrders = orders.filter(
      (order) =>
         order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.id.toString().includes(searchTerm)
   );

   // Sort orders by createdAt descending (newest first)
   const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   return (
      <div>
         <h1 className="text-3xl font-semibold mb-6">Orders</h1>

         <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
               <div className="relative">
                  <input
                     type="text"
                     placeholder="Search orders..."
                     className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
               </div>
               <div>
                  <select
                     className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={filterStatus || ""}
                     onChange={(e) => setFilterStatus(e.target.value || null)}>
                     <option value="">All Statuses</option>
                     <option value="Menunggu_Konfirmasi">Waiting for Confirmation</option>
                     <option value="Dikonfirmasi">Confirmed</option>
                     <option value="Dikirim">Shipped</option>
                     <option value="Sampai">Delivered</option>
                     <option value="Dibatalkan">Cancelled</option>
                  </select>
               </div>
            </div>

            {loading ? (
               <div className="text-center py-4">
                  <p>Loading orders...</p>
               </div>
            ) : error ? (
               <div className="text-center py-4 text-red-500">
                  <p>{error}</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  {filteredOrders.length === 0 ? (
                     <div className="text-center py-4">
                        <p>No orders found.</p>
                     </div>
                  ) : (
                     <table className="table-auto w-full">
                        <thead>
                           <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left">No</th>
                              <th className="px-4 py-2 text-left">Order ID</th>
                              <th className="px-4 py-2 text-left">Customer</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Total</th>
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {sortedOrders.map((order, idx) => (
                              <tr key={order.id} className="border-b">
                                 <td className="px-4 py-2">{idx + 1}</td>
                                 <td className="px-4 py-2">#{order.id}</td>
                                 <td className="px-4 py-2">{order.customer || order.name}</td>
                                 <td className="px-4 py-2">
                                    <span
                                       className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                          order.status
                                       )}`}>
                                       {order.status.replace("_", " ")}
                                    </span>
                                 </td>
                                 <td className="px-4 py-2">{formatCurrency(order.totalPrice)}</td>
                                 <td className="px-4 py-2">
                                    {new Date(order.createdAt || order.date).toLocaleDateString()}
                                 </td>
                                 <td className="px-4 py-2">
                                    <select
                                       className="border rounded-lg px-2 py-1 text-sm"
                                       value={order.status}
                                       onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                                       <option value="Menunggu_Konfirmasi">Waiting for Confirmation</option>
                                       <option value="Dikonfirmasi">Confirmed</option>
                                       <option value="Dikirim">Shipped</option>
                                       <option value="Sampai">Delivered</option>
                                       <option value="Dibatalkan">Cancelled</option>
                                    </select>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}

export default Orders;
