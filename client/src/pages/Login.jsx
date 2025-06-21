import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login } from "../service/api/authService";
import { AuthContext } from "../App";

function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const location = useLocation();
   const { setAuthState } = useContext(AuthContext);

   // Get redirect path from location state or default to homepage
   const from = location.state?.from?.pathname || "/";

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
         const response = await login({ email, password });
         console.log("Login successful:", response);

         // Update auth context with user data from cookies/session
         setAuthState({
            user: response.User,
            isAuthenticated: true,
            isAdmin: response.User.role === "ADMIN",
            isLoading: false,
         });

         // Redirect berdasarkan role
         if (response.User.role === "ADMIN") {
            navigate("/admin");
         } else {
            // Redirect ke halaman yang user coba akses sebelumnya atau ke homepage
            navigate(from, { replace: true });
         }
      } catch (error) {
         console.error("Login failed:", error);
         setError(
            error.response?.data?.message ||
               "Login gagal. Periksa email dan password Anda."
         );
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
                     Login To Your Account
                  </h2>
               </div>
               {location.state?.message && (
                  <div className="alert alert-success mb-4">
                     <span>{location.state.message}</span>
                  </div>
               )}
               {error && (
                  <div className="alert alert-error mb-4">
                     <span>{error}</span>
                  </div>
               )}
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Email</span>
                     </label>
                     <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input input-bordered"
                        required
                        placeholder="Tuliskan email anda disini..."
                        disabled={loading}
                     />
                  </div>
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Password</span>
                     </label>
                     <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input input-bordered"
                        required
                        placeholder="***********"
                        disabled={loading}
                     />
                  </div>
                  <button
                     type="submit"
                     className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                     disabled={loading}>
                     {loading ? "Memproses..." : "Login"}
                  </button>
               </form>
               <div className="text-center mt-4">
                  Belum punya akun?{" "}
                  <Link to="/register" className="link link-primary">
                     Register
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default Login;
