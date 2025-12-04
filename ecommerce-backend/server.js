import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";


import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(express.json());


const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost";


app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive" });
});


app.get("/health/ready", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: "ready" });
  }
  res.status(503).json({ status: "not ready" });
});

app.use(errorHandler);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
});

io.on("connection", socket => {
  console.log("⚡ Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("❌ Socket disconnected:", socket.id));
});


const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;

async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is not set in env");
    }
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🟢 MongoDB connected");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`🔐 Allowed frontend origin: ${FRONTEND_URL}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
