import axios from "axios";

/**
 * Handles shipping cost calculation using RajaOngkir API.
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getShippingCost = async (req, res) => {
  try {
    const { origin, destination, weight, courier } = req.body;

    // Validate input
    if (!origin || !destination || !weight || !courier) {
      return res.status(400).json({ message: "All fields are required: origin, destination, weight, courier." });
    }
    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({ message: "Weight must be a positive number." });
    }

    // Prepare RajaOngkir API request
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    const baseUrl = process.env.RAJAONGKIR_BASE_URL || "https://api.rajaongkir.com/starter";
    const url = `${baseUrl}/cost`;

    const response = await axios.post(
      url,
      {
        origin,
        destination,
        weight,
        courier,
      },
      {
        headers: {
          key: apiKey,
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Extract and return relevant data
    const results = response.data?.rajaongkir?.results?.[0]?.costs || [];
    res.json({ services: results });
  } catch (error) {
    // Handle RajaOngkir API or other errors
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.rajaongkir?.status?.description || "RajaOngkir API error",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}; 