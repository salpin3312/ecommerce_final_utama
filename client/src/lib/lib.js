export const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactCurrency = (value) => {
  if (value >= 1e12) return `Rp ${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(2)}M`;
  if (value >= 1e8) return `Rp ${(value / 1e8).toFixed(2)}ratus jt`;
  if (value >= 1e7) return `Rp ${(value / 1e7).toFixed(2)}puluh jt`;
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(2)}jt`;
  return formatCurrency(value);
};

export const formatCompactNumber = (value) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}M`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}jt`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}rb`;
  return value.toString();
};
