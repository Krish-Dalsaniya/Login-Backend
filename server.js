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
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Backend API | Status Online</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #10b981;
                --bg: #0f172a;
                --card-bg: #1e293b;
                --text: #f8fafc;
            }
            body {
                margin: 0;
                font-family: 'Inter', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                overflow: hidden;
            }
            .container {
                text-align: center;
                background: var(--card-bg);
                padding: 3rem;
                border-radius: 1.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                max-width: 500px;
                width: 90%;
                transform: translateY(0);
                animation: float 6s ease-in-out infinite;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
            .status-dot {
                width: 12px;
                height: 12px;
                background-color: var(--primary);
                border-radius: 50%;
                display: inline-block;
                margin-right: 8px;
                box-shadow: 0 0 15px var(--primary);
            }
            h1 { font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.025em; }
            p { color: #94a3b8; margin-bottom: 2rem; }
            .badge {
                background: rgba(16, 185, 129, 0.1);
                color: var(--primary);
                padding: 0.5rem 1rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
            }
            .links {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 2rem;
            }
            .btn {
                text-decoration: none;
                background: rgba(255, 255, 255, 0.05);
                color: var(--text);
                padding: 0.75rem;
                border-radius: 0.75rem;
                font-weight: 600;
                transition: all 0.2s;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: var(--primary);
                color: var(--primary);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">
                <span class="status-dot"></span>
                SYSTEM OPERATIONAL
            </div>
            <h1>Backend API</h1>
            <p>Your server is running smoothly in ${process.env.NODE_ENV || 'development'} mode.</p>
            <div class="links">
                <a href="/health" class="btn">Health Check</a>
                <a href="/api/user/test" class="btn">Auth Test</a>
            </div>
        </div>
    </body>
    </html>
  `);
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

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.url}`,
    error: "Not Found",
    status: 404
  });
});

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
