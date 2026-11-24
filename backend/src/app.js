import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import resumeRoutes from "./routes/resumeRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";
import { getRedirectData } from "./controllers/redirectController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
const distDir = path.resolve(__dirname, "../../dist");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/redirect", redirectRoutes);

// Smart Link (/a) direct redirect route
app.get(["/a", "/a/"], (req, res, next) => {
  const redirectInfo = getRedirectData();
  const envActive = process.env.REDIRECT_A_ACTIVE;
  const envTarget = process.env.REDIRECT_A_TARGET;

  const isActive = envActive !== undefined
    ? String(envActive).trim().toLowerCase() === "true" || String(envActive).trim() === "1"
    : Boolean(redirectInfo?.isActive);

  const targetUrl = (envTarget && String(envTarget).trim() !== "")
    ? String(envTarget).trim()
    : String(redirectInfo?.targetUrl || "").trim();

  if (isActive && targetUrl) {
    return res.redirect(307, targetUrl);
  }
  next();
});

app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
  })
);

// Serve frontend build if dist folder exists (Compatible with Express 5)
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // Catch-all handler for SPA and Astro routes in Express 5
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    const cleanPath = req.path.replace(/^\//, "");
    const indexPath = path.resolve(distDir, cleanPath, "index.html");
    if (cleanPath && fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    const filePath = path.resolve(distDir, cleanPath);
    if (cleanPath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    res.sendFile(path.resolve(distDir, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Portfolio Backend is running");
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Request failed"
    });
  }
  next();
});

export default app;
