# Midtrans Troubleshooting Guide

## Error 401 - Access Denied

### Penyebab Umum:

1. **Server Key atau Client Key salah/expired**
2. **Environment variables tidak terbaca dengan benar**
3. **Key Midtrans tidak valid untuk environment yang digunakan**

### Solusi:

#### 1. Periksa Environment Variables

Pastikan file `.env` di folder `server/` berisi:

```
MIDTRANS_SERVER_KEY=SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA
MIDTRANS_CLIENT_KEY=SB-Mid-client-GwUP_WGbJPXsDzsNEBRs8IYA
```

#### 2. Restart Server

Setelah mengubah environment variables, restart server:

```bash
cd server
npm run dev
```

#### 3. Periksa Console Log

Server akan menampilkan log Midtrans configuration saat startup. Pastikan key terbaca dengan benar.

#### 4. Key Midtrans yang Benar

Untuk development/sandbox, gunakan key berikut:

-  **Server Key**: `SB-Mid-server-GwUP_WGbJPXsDzsNEBRs8IYA`
-  **Client Key**: `SB-Mid-client-GwUP_WGbJPXsDzsNEBRs8IYA`

Untuk production, gunakan key dari dashboard Midtrans Anda.

#### 5. Debug Mode

Jika masih error, periksa console browser dan server untuk melihat detail error yang lebih spesifik.

### Testing Midtrans

Untuk test pembayaran di sandbox, gunakan kartu test Midtrans:

-  **Visa**: 4811 1111 1111 1114
-  **Mastercard**: 5211 1111 1111 1117
-  **Expired Date**: 01/25
-  **CVV**: 123

### Contact Support

Jika masalah masih berlanjut, hubungi Midtrans support atau periksa dokumentasi resmi di https://docs.midtrans.com/
