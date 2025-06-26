import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../service/api/authService";

function Register() {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
   });
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      // Validasi
      if (formData.password !== formData.confirmPassword) {
         setError("Password tidak cocok");
         return;
      }

      if (formData.password.length < 8) {
         setError("Password minimal 8 karakter");
         return;
      }

      setLoading(true);

      try {
         // Siapkan data untuk API (tanpa confirmPassword)
         const { confirmPassword, ...registerData } = formData;

         // Panggil fungsi register dari authService
         await register(registerData);

         // Redirect ke login dengan pesan sukses
         navigate("/login", {
            state: { message: "Registrasi berhasil! Silakan login." },
         });
      } catch (err) {
         // Tampilkan pesan error dari API
         setError(err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
         <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
               <div className="flex flex-col items-center">
                  <h1 className="text-2xl font-bold mb-4 text-center">SCREAMBLE</h1>
                  <h2 className="divider divider-primary justify-center text-md mb-4">
                     Register To Your Account
                  </h2>
               </div>
               {error && (
                  <div className="alert alert-error mb-4">
                     <span>{error}</span>
                  </div>
               )}
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Nama</span>
                     </label>
                     <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input input-bordered"
                        required
                        placeholder="Masukkan Nama Anda disini..."
                        disabled={loading}
                     />
                  </div>
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Email</span>
                     </label>
                     <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input input-bordered"
                        required
                        placeholder="Masukkan Email Anda disini..."
                        disabled={loading}
                     />
                  </div>
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Password (min. 8 karakter)</span>
                     </label>
                     <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input input-bordered"
                        required
                        placeholder="Masukkan Password Anda disini..."
                        disabled={loading}
                     />
                  </div>
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Konfirmasi Password</span>
                     </label>
                     <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input input-bordered"
                        required
                        placeholder="Masukkan Konfirmasi Password disini..."
                        disabled={loading}
                     />
                  </div>
                  <button
                     type="submit"
                     className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                     disabled={loading}>
                     {loading ? "Memproses..." : "Register"}
                  </button>
               </form>
               <div className="text-center mt-4">
                  Sudah punya akun?{" "}
                  <Link to="/login" className="link link-primary">
                     Login
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Register;
