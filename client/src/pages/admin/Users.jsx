import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUserById,
  updateUserById,
  createUser,
} from "../../service/api/userService";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa";
import { toast } from "react-hot-toast";

const initialEditState = {
  id: "",
  name: "",
  email: "",
  role: "ADMIN",
  newPassword: "",
};
const initialCreateState = { name: "", email: "", password: "", role: "ADMIN" };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(initialEditState);
  const [createUserData, setCreateUserData] = useState(initialCreateState);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [createError, setCreateError] = useState("");

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

  const handleCreate = () => {
    setCreateUserData(initialCreateState);
    setCreateError("");
    setCreateModalOpen(true);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    if (createUserData.password.length < 6) {
      setCreateError("Password minimal 6 karakter.");
      setCreateLoading(false);
      return;
    }

    try {
      await createUser(createUserData);
      toast.success("Admin berhasil dibuat.");
      setCreateModalOpen(false);
      setCreateUserData(initialCreateState);
      await fetchUsers();
    } catch (err) {
      setCreateError(err?.response?.data?.message || "Gagal membuat admin.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      newPassword: "",
    });
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
      toast.success("Admin berhasil diupdate.");
      setEditModalOpen(false);
      setEditUser(initialEditState);
      await fetchUsers();
    } catch (err) {
      setEditError(err?.response?.data?.message || "Gagal mengupdate admin.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Yakin ingin menghapus admin '${user.name}'?`)) return;
    setDeletingId(user.id);
    try {
      await deleteUserById(user.id);
      toast.success("Admin berhasil dihapus.");
      await fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menghapus admin.");
    } finally {
      setDeletingId(null);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUser(initialEditState);
    setEditError("");
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateUserData(initialCreateState);
    setCreateError("");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola User</h1>
        <button
          onClick={handleCreate}
          className="btn btn-primary btn-sm"
          disabled={loading}
        >
          <FaPlus className="mr-2" />
          Tambah Admin
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data user.
          </div>
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
                      }`}
                    >
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-yellow-400 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
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
                        {/* Tombol Edit - hanya untuk admin */}
                        {user.role === "ADMIN" ? (
                          <button
                            className="btn btn-xs btn-warning"
                            title="Edit Admin"
                            onClick={() => handleEdit(user)}
                            disabled={deletingId !== null}
                          >
                            <FaEdit />
                          </button>
                        ) : (
                          <button
                            className="btn btn-xs btn-info"
                            title="Lihat User"
                            disabled={true}
                          >
                            <FaEye />
                          </button>
                        )}

                        {/* Tombol Hapus - hanya untuk admin */}
                        {user.role === "ADMIN" && (
                          <button
                            className="btn btn-xs btn-error"
                            title="Hapus Admin"
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={closeCreateModal}
              disabled={createLoading}
              aria-label="Tutup"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Tambah Admin Baru</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={createUserData.name}
                  onChange={handleCreateChange}
                  className="input input-bordered w-full"
                  required
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={createUserData.email}
                  onChange={handleCreateChange}
                  className="input input-bordered w-full"
                  required
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={createUserData.password}
                  onChange={handleCreateChange}
                  className="input input-bordered w-full"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  disabled={createLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={createUserData.role}
                  onChange={handleCreateChange}
                  className="select select-bordered w-full"
                  required
                  disabled={createLoading}
                >
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {createError && (
                <div className="text-red-500 text-sm">{createError}</div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-ghost mr-2"
                  onClick={closeCreateModal}
                  disabled={createLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Buat Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={closeEditModal}
              disabled={editLoading}
              aria-label="Tutup"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Admin</h2>
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
                <label className="block text-sm font-medium mb-1">
                  Password Baru (opsional)
                </label>
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
              {editError && (
                <div className="text-red-500 text-sm">{editError}</div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-ghost mr-2"
                  onClick={closeEditModal}
                  disabled={editLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Simpan"
                  )}
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
