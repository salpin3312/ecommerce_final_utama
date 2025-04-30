import midtransClient from "midtrans-client";

export const coreApi = new midtransClient.CoreApi({
  isProduction: false, // Ubah menjadi true jika sudah di production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const snap = new midtransClient.Snap({
  isProduction: false, // Ubah menjadi true jika sudah di production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});
