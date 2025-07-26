import axios from "axios";

/**
 * Get provinces data from RajaOngkir API
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getProvinces = async (req, res) => {
  try {
    const baseUrl =
      process.env.RAJAONGKIR_BASE_URL || "https://rajaongkir.komerce.id/api/v1";
    const url = `${baseUrl}/destination/province`;
    const apiKey = process.env.RAJAONGKIR_API_KEY;

    const response = await axios.get(url, {
      headers: {
        accept: "application/json",
        key: apiKey,
      },
    });

    // Extract provinces data from RajaOngkir response
    const provinces = response.data?.data || [];
    res.json({ provinces });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        message: "Failed to fetch provinces data",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get cities data from RajaOngkir API by province ID
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getCities = async (req, res) => {
  try {
    const { provinceId } = req.params;

    if (!provinceId) {
      return res.status(400).json({
        message: "Province ID is required",
      });
    }

    const baseUrl =
      process.env.RAJAONGKIR_BASE_URL || "https://rajaongkir.komerce.id/api/v1";
    const url = `${baseUrl}/destination/city/${provinceId}`;
    const apiKey = process.env.RAJAONGKIR_API_KEY;

    const response = await axios.get(url, {
      headers: {
        accept: "application/json",
        key: apiKey,
      },
    });

    // Extract cities data from RajaOngkir response
    const cities = response.data?.data || [];
    res.json({ cities });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        message: "Failed to fetch cities data",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Handles shipping cost calculation using RajaOngkir API.
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getShippingCost = async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;

    console.log("Received shipping cost request:", {
      origin,
      destination,
      weight,
      courier,
    });

    // Validate input
    if (!origin || !destination || !weight || !courier) {
      console.log("Missing required fields:", {
        origin,
        destination,
        weight,
        courier,
      });
      return res.status(400).json({
        message:
          "All fields are required: origin, destination, weight, courier.",
      });
    }
    if (isNaN(weight) || weight <= 0) {
      return res
        .status(400)
        .json({ message: "Weight must be a positive number." });
    }

    // Prepare RajaOngkir API request with updated base URL
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    const baseUrl =
      process.env.RAJAONGKIR_BASE_URL || "https://rajaongkir.komerce.id/api/v1";
    const url = `${baseUrl}/calculate/district/domestic-cost`;

    console.log("Calling RajaOngkir API:", {
      url,
      origin,
      destination,
      weight,
      courier,
    });

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append("origin", origin);
    formData.append("destination", destination);
    formData.append("weight", weight);
    formData.append("courier", courier);
    formData.append("price", "lowest"); // Add price parameter

    const response = await axios.post(url, formData, {
      headers: {
        accept: "application/json",
        key: apiKey,
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    console.log("RajaOngkir response:", response.data);

    // Extract and return relevant data from new format
    const results = response.data?.data || [];
    res.json({ services: results });
  } catch (error) {
    console.error(
      "Shipping cost error:",
      error.response?.data || error.message
    );
    // Handle RajaOngkir API or other errors
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.meta?.message || "RajaOngkir API error",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
