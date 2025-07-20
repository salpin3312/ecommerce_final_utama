"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadUserAvatar,
} from "../service/api/userService";
import { logout } from "../service/api/authService";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, setAuthState } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile dari backend saat komponen mount
    const fetchProfile = async () => {
      try {
        const userData = await getUserProfile();
        console.log("Fetched user data:", userData);

        // Update auth state
        setAuthState((prev) => ({
          ...prev,
          user: userData,
        }));

        // Update form data dengan data user yang di-fetch
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth
            ? userData.dateOfBirth.split("T")[0]
            : "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Gagal memuat data profile");
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          dateOfBirth: "",
        });
      }
    };
    fetchProfile();
  }, [setAuthState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await updateUserProfile(formData);
      console.log("Update response:", response);

      // Fetch ulang profile setelah update
      const userData = await getUserProfile();
      console.log("Refetched user data:", userData);

      setAuthState((prev) => ({
        ...prev,
        user: userData,
      }));

      // Update form data dengan data terbaru
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        dateOfBirth: userData.dateOfBirth
          ? userData.dateOfBirth.split("T")[0]
          : "",
      });

      setIsEditing(false);
      toast.success(response.message || "Profile berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal memperbarui profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter!");
      return;
    }
    setLoading(true);
    try {
      const response = await changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      toast.success(
        response.message || "Password berhasil diubah! Silakan login ulang."
      );
      // Logout otomatis setelah ganti password
      await logout();
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Password berhasil diubah! Silakan login ulang." },
        });
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Gagal mengubah password");
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      });
    }
    setIsEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const response = await uploadUserAvatar(file);
        console.log(response);
        setAuthState((prev) => ({
          ...prev,
          user: response.user,
        }));
        toast.success(response.message || "Avatar berhasil diupload!");
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Gagal upload avatar"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    console.log("No user data in context");
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 mb-6">
            Silakan login terlebih dahulu untuk mengakses halaman profile.
          </p>
          <a
            href="/login"
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  console.log("Current user data:", user);
  console.log("Current form data:", formData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-gray-50 to-zinc-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Profile Saya
          </h1>
          <p className="text-lg text-gray-600">
            Kelola informasi personal Anda
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-12 text-white relative">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user.avatar ? (
                      <img
                        src={`http://localhost:8000${user.avatar}`}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white text-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                  <p className="text-white/80 mb-1">{user.email}</p>
                  <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    {user.role === "ADMIN" ? "Administrator" : "Customer"}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="absolute top-6 right-6">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Informasi Personal
                  </h3>

                  {/* Name */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.name || "Belum diisi"}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                      {user.email || "Belum diisi"}
                      <span className="text-xs text-gray-500 block mt-1">
                        Email tidak dapat diubah
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 mr-2" />
                      Nomor Telepon
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Masukkan nomor telepon"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.phone || "Belum diisi"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Informasi Tambahan
                  </h3>

                  {/* Address */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      Alamat
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                        placeholder="Masukkan alamat lengkap"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 min-h-[80px]">
                        {user.address || "Belum diisi"}
                      </div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Tanggal Lahir
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800">
                        {user.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString(
                              "id-ID"
                            )
                          : "Belum diisi"}
                      </div>
                    )}
                  </div>

                  {/* Account Info */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Tipe Akun
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Administrator" : "Customer"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Mobile */}
              {isEditing && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4 md:hidden">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Keamanan Akun
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">
                        Ubah Password
                      </div>
                      <div className="text-sm text-gray-600">
                        Perbarui password akun Anda
                      </div>
                    </div>
                  </div>
                </button>

                {/* Password Change Form */}
                {showPasswordForm && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                    <h4 className="font-semibold text-gray-800">
                      Ubah Password
                    </h4>

                    {/* Current Password */}
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Password saat ini"
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Password baru"
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Konfirmasi password baru"
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={loading}
                        className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? "Mengubah..." : "Ubah Password"}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Riwayat Pesanan
              </h3>
              <div className="space-y-4">
                <button
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  onClick={() => navigate("/cart")}
                >
                  <div className="font-medium text-gray-800">Lihat Pesanan</div>
                  <div className="text-sm text-gray-600">
                    Cek status dan riwayat pesanan
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
