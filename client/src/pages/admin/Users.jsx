import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUserById, updateUserById } from "../../service/api/userService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

const initialEditState = { id: "", name: "", email: "", role: "USER", newPassword: "" };

const Users = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [deletingId, setDeletingId] = useState(null);
   const [editModalOpen, setEditModalOpen] = useState(false);
   const [editUser, setEditUser] = useState(initialEditState);
   const [editLoading, setEditLoading] = useState(false);
   const [editError, setEditError] = useState("");

   const fetchUsers = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await getAllUsers();
         setUsers(data.users || []);
      } catch (err) {
         setError("Gagal memuat data user.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUsers();
   }, []);

   const handleEdit = (user) => {
      setEditUser({ id: user.id, name: user.name, email: user.email, role: user.role, newPassword: "" });
      setEditError("");
      setEditModalOpen(true);
   };

   const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditUser((prev) => ({ ...prev, [name]: value }));
   };

   const handleEditSubmit = async (e) => {
      e.preventDefault();
      setEditLoading(true);
      setEditError("");
      if (editUser.newPassword && editUser.newPassword.length < 6) {
         setEditError("Password minimal 6 karakter.");
         setEditLoading(false);
         return;
      }
      try {
         const payload = {
            name: editUser.name,
            email: editUser.email,
            role: editUser.role,
         };
         if (editUser.newPassword) {
            payload.newPassword = editUser.newPassword;
         }
         await updateUserById(editUser.id, payload);
         toast.success("User berhasil diupdate.");
         setEditModalOpen(false);
         setEditUser(initialEditState);
         await fetchUsers();
      } catch (err) {
         setEditError(err?.response?.data?.message || "Gagal mengupdate user.");
      } finally {
         setEditLoading(false);
      }
   };

   const handleDelete = async (user) => {
      if (!window.confirm(`Yakin ingin menghapus user '${user.name}'?`)) return;
      setDeletingId(user.id);
      try {
         await deleteUserById(user.id);
         toast.success("User berhasil dihapus.");
         await fetchUsers();
      } catch (err) {
         toast.error(err?.response?.data?.message || "Gagal menghapus user.");
      } finally {
         setDeletingId(null);
      }
   };

   const closeEditModal = () => {
      setEditModalOpen(false);
      setEditUser(initialEditState);
      setEditError("");
   };

   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">Users Management</h1>
         <div className="bg-white rounded-lg shadow-lg p-6">
            {loading ? (
               <div>Loading...</div>
            ) : error ? (
               <div className="text-red-500">{error}</div>
            ) : users.length === 0 ? (
               <div>No users found.</div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border rounded-lg overflow-hidden">
                     <thead>
                        <tr className="bg-primary text-white">
                           <th className="px-4 py-2 text-left">No</th>
                           <th className="px-4 py-2 text-left">Name</th>
                           <th className="px-4 py-2 text-left">Email</th>
                           <th className="px-4 py-2 text-left">Role</th>
                           <th className="px-4 py-2 text-left">Dibuat</th>
                           <th className="px-4 py-2 text-center">Aksi</th>
                        </tr>
                     </thead>
                     <tbody>
                        {users
                           .slice() // copy array
                           .sort((a, b) => {
                              if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
                              if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
                              return new Date(a.createdAt) - new Date(b.createdAt);
                           })
                           .map((user, idx) => (
                              <tr
                                 key={user.id}
                                 className={`border-b hover:bg-orange-50 transition ${
                                    user.role === "ADMIN" ? "font-bold bg-orange-100" : ""
                                 }`}>
                                 <td className="px-4 py-2">{idx + 1}</td>
                                 <td className="px-4 py-2">{user.name}</td>
                                 <td className="px-4 py-2">{user.email}</td>
                                 <td className="px-4 py-2">
                                    <span
                                       className={`px-2 py-1 rounded text-xs font-semibold ${
                                          user.role === "ADMIN"
                                             ? "bg-yellow-400 text-white"
                                             : "bg-gray-200 text-gray-700"
                                       }`}>
                                       {user.role}
                                    </span>
                                 </td>
                                 <td className="px-4 py-2">
                                    {user.createdAt
                                       ? new Date(user.createdAt).toLocaleString("id-ID", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                         })
                                       : "-"}
                                 </td>
                                 <td className="px-4 py-2 text-center space-x-2">
                                    <button
                                       className="btn btn-xs btn-warning"
                                       title="Edit"
                                       onClick={() => handleEdit(user)}
                                       disabled={deletingId !== null}>
                                       <FaEdit />
                                    </button>
                                    <button
                                       className="btn btn-xs btn-error"
                                       title="Hapus"
                                       onClick={() => handleDelete(user)}
                                       disabled={user.role === "ADMIN" || deletingId === user.id}>
                                       {deletingId === user.id ? (
                                          <span className="loading loading-spinner loading-xs"></span>
                                       ) : (
                                          <FaTrash />
                                       )}
                                    </button>
                                 </td>
                              </tr>
                           ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {/* Edit User Modal */}
         {editModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
               <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                  <button
                     className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                     onClick={closeEditModal}
                     disabled={editLoading}
                     aria-label="Tutup">
                     &times;
                  </button>
                  <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                           type="text"
                           name="name"
                           value={editUser.name}
                           onChange={handleEditChange}
                           className="input input-bordered w-full"
                           required
                           disabled={editLoading}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                           type="email"
                           name="email"
                           value={editUser.email}
                           onChange={handleEditChange}
                           className="input input-bordered w-full"
                           required
                           disabled={editLoading}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Password Baru (opsional)</label>
                        <input
                           type="password"
                           name="newPassword"
                           value={editUser.newPassword}
                           onChange={handleEditChange}
                           className="input input-bordered w-full"
                           minLength={6}
                           placeholder="Minimal 6 karakter"
                           disabled={editLoading}
                        />
                     </div>
                     {editError && <div className="text-red-500 text-sm">{editError}</div>}
                     <div className="flex justify-end">
                        <button
                           type="button"
                           className="btn btn-ghost mr-2"
                           onClick={closeEditModal}
                           disabled={editLoading}>
                           Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={editLoading}>
                           {editLoading ? <span className="loading loading-spinner loading-xs"></span> : "Simpan"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default Users;
