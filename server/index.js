import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./src/route/index.js";
import { sessionMiddleware } from "./src/middleware/sessionMiddleware.js";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const app = express();

dotenv.config();

const corsOptions = {
  origin: "http://localhost:5173", // Ganti dengan origin frontend
  credentials: true, // Izinkan kredensial
  methods: ["GET", "POST", "PUT", "DELETE"], // Izinkan method yang diperlukan
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(sessionMiddleware);
app.use("/api", router);
app.use("/uploads", express.static("public/uploads"));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the e-commerce backend, including shipping cost (ongkir) endpoints.",
    },
    servers: [
      { url: "http://localhost:" + process.env.PORT + "/api" },
    ],
  },
  apis: [
    "./src/route/*.js",
  ],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
