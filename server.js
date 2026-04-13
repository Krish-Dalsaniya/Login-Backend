const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const sequelize = require("./config/db");
const User = require("./models/User");
const authRoute = require("./routes/auth");
const dashboardRoute = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

const defaultAllowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : defaultAllowedOrigins;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, auth-token, Authorization",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the backend API!",
    health: "/health",
    api: "/api"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "backend_final",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/user", authRoute);
app.use("/api/dashboard", dashboardRoute);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected Successfully!");
    if (isProduction) {
      console.log("ℹ️ Production mode: skipping sequelize.sync({ alter: true })");
    } else {
      await sequelize.sync({ alter: true });
      console.log("📁 Database Tables Synced");
    }
  } catch (err) {
    console.error("❌ Database Connection Error:", err);
  }
}

startServer();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
