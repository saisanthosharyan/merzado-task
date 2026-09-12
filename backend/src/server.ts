import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import rfqRoutes from "./routes/rfqRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/quotations", quotationRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "B2B RFQ Marketplace API is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled server error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });