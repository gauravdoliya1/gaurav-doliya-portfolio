import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import resumeRoutes from "./routes/resumeRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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

app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
  })
);

// Serve frontend build if dist folder exists (for fullstack Render Web Service deployment)
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    const cleanPath = req.path.replace(/^\//, "");
    const indexPath = path.resolve(distDir, cleanPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    const filePath = path.resolve(distDir, cleanPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    res.sendFile(path.resolve(distDir, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Portfolio Backend is running");
  });
}

// Error handling middleware for Multer and other errors
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
