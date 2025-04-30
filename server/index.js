import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./src/route/index.js";
import { sessionMiddleware } from "./src/middleware/sessionMiddleware.js";
import path from "path";

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

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
