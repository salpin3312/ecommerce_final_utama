import midtransClient from "midtrans-client";

// Debug: Log environment variables
console.log("MIDTRANS_SERVER_KEY:", process.env.MIDTRANS_SERVER_KEY);
console.log("MIDTRANS_CLIENT_KEY:", process.env.MIDTRANS_CLIENT_KEY);

// Validate environment variables
if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
   console.error("ERROR: Midtrans environment variables are not set!");
   console.error("Please check your .env file");
}

// Use fallback keys for development if needed
const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-GwUP_WGbJPXsDzsNEBRs8IYA";

export const coreApi = new midtransClient.CoreApi({
   isProduction: false, // Ubah menjadi true jika sudah di production
   serverKey: serverKey,
   clientKey: clientKey,
});

export const snap = new midtransClient.Snap({
   isProduction: false, // Ubah menjadi true jika sudah di production
   serverKey: serverKey,
   clientKey: clientKey,
});
