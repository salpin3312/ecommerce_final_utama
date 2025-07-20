export const formatCurrency = (value) => {
   return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);
};

export const formatCompactCurrency = (value) => {
   // Pastikan value adalah number
   const num = typeof value === "number" ? value : Number(value);
   if (isNaN(num) || num === null) return "Rp 0";
   // Debug log
   // console.log("formatCompactCurrency input:", num);
   if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(2)}T`;
   if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(2)}M`;
   if (num >= 1e8) return `Rp ${(num / 1e8).toFixed(2)}ratus jt`;
   if (num >= 1e7) return `Rp ${(num / 1e7).toFixed(2)}puluh jt`;
   if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(2)}jt`;
   return formatCurrency(num);
};

export const formatCompactNumber = (value) => {
   const num = typeof value === "number" ? value : Number(value);
   if (isNaN(num) || num === null) return "0";
   if (num >= 1e9) return `${(num / 1e9).toFixed(2)}M`;
   if (num >= 1e6) return `${(num / 1e6).toFixed(2)}jt`;
   if (num >= 1e3) return `${(num / 1e3).toFixed(2)}rb`;
   return num.toString();
};
