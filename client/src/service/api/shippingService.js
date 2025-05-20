import axiosInstance from "../axiosService";

/**
 * Get shipping cost from backend (RajaOngkir API)
 * @param {Object} params
 * @param {string} params.origin - City ID of the sender
 * @param {string} params.destination - City ID of the receiver
 * @param {number} params.weight - Weight in grams
 * @param {string} params.courier - Courier code (e.g., jne, tiki, pos)
 * @returns {Promise<Object>} Shipping options
 */
export async function getShippingCost({ origin, destination, weight, courier }) {
  const response = await axiosInstance.post("/api/shipping/cost", {
    origin,
    destination,
    weight,
    courier,
  });
  return response.data;
}

/**
 * Get list of cities from backend (RajaOngkir API)
 * @returns {Promise<Array>} List of cities
 */
export async function getCities() {
  const response = await axiosInstance.get("/api/shipping/cities");
  return response.data.cities;
} 