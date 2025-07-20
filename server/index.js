import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./src/route/index.js";
import { sessionMiddleware } from "./src/middleware/sessionMiddleware.js";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import * as paymentController from "./src/controller/payment.controller.js";

const app = express();

dotenv.config();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Pasang endpoint notifikasi Midtrans langsung, tanpa sessionMiddleware
app.post("/api/payment/notification", paymentController.handleNotification);

// Setelah itu, pasang sessionMiddleware untuk route lain
app.use(sessionMiddleware);
app.use("/api", router);
app.use("/uploads", express.static("public/uploads"));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "API documentation for the e-commerce backend, including shipping cost (ongkir) endpoints.",
    },
    servers: [{ url: "http://localhost:" + process.env.PORT + "/api" }],
  },
  apis: ["./src/route/*.js"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
