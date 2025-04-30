import cookieSession from "cookie-session";

export const sessionMiddleware = cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET || "defaultSecretKey"], // Gunakan env untuk keamanan
  maxAge: 24 * 60 * 60 * 1000, // 24 jam
  httpOnly: true, // Mencegah akses dari JavaScript
  secure: process.env.NODE_ENV === "production", // Hanya aktif di HTTPS
  sameSite: "strict",
});
