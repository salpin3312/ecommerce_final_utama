import { Router } from "express";
import {
  getShippingCost,
  getProvinces,
  getCities,
} from "../controller/shippingController.js";

const routerShipping = Router();

/**
 * @swagger
 * /shipping/provinces:
 *   get:
 *     summary: Get list of provinces from RajaOngkir
 *     tags: [Shipping]
 *     responses:
 *       200:
 *         description: List of provinces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 provinces:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
routerShipping.get("/provinces", getProvinces);

/**
 * @swagger
 * /shipping/cities/{provinceId}:
 *   get:
 *     summary: Get list of cities from RajaOngkir by province ID
 *     tags: [Shipping]
 *     parameters:
 *       - in: path
 *         name: provinceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Province ID
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
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       400:
 *         description: Province ID is required
 *       500:
 *         description: Internal server error
 */
routerShipping.get("/cities/:provinceId", getCities);

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
routerShipping.post("/cost", getShippingCost);

export default routerShipping;
