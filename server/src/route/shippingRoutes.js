import { Router } from "express";
import { getShippingCost } from "../controller/shippingController.js";
import axios from "axios";

const routerShipping = Router();

/**
 * @swagger
 * /shipping/cities:
 *   get:
 *     summary: Get list of cities from RajaOngkir
 *     tags: [Shipping]
 *     responses:
 *       200:
 *         description: List of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       city_id:
 *                         type: string
 *                       city_name:
 *                         type: string
 *                       province:
 *                         type: string
 *                       province_id:
 *                         type: string
 *                       type:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
routerShipping.get("/shipping/cities", async (req, res) => {
  try {
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    const baseUrl = process.env.RAJAONGKIR_BASE_URL || "https://api.rajaongkir.com/starter";
    const url = `${baseUrl}/city`;
    const response = await axios.get(url, {
      headers: { key: apiKey },
    });
    const cities = response.data?.rajaongkir?.results || [];
    res.json({ cities });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cities" });
  }
});

/**
 * @swagger
 * /shipping/cost:
 *   post:
 *     summary: Get shipping cost from RajaOngkir
 *     description: Returns available shipping services, costs, and estimated delivery times.
 *     tags:
 *       - Shipping
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin
 *               - destination
 *               - weight
 *               - courier
 *             properties:
 *               origin:
 *                 type: string
 *                 description: City ID of the sender
 *                 example: "501"
 *               destination:
 *                 type: string
 *                 description: City ID of the receiver
 *                 example: "114"
 *               weight:
 *                 type: integer
 *                 description: Weight in grams
 *                 example: 1700
 *               courier:
 *                 type: string
 *                 description: Courier code (e.g., jne, tiki, pos)
 *                 example: "jne"
 *     responses:
 *       200:
 *         description: List of available shipping services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       service:
 *                         type: string
 *                         description: Service code
 *                       description:
 *                         type: string
 *                         description: Service description
 *                       cost:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: integer
 *                               description: Cost in IDR
 *                             etd:
 *                               type: string
 *                               description: Estimated delivery time
 *                             note:
 *                               type: string
 *                               description: Additional notes
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
routerShipping.post("/shipping/cost", getShippingCost);

export default routerShipping; 