import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDataFile = path.resolve(__dirname, "../../data/redirectConfig.json");
const frontendDataFile = path.resolve(__dirname, "../../../frontend/src/data/redirectConfig.json");
const distDataFile = path.resolve(__dirname, "../../../dist/data/redirectConfig.json");

const defaultRedirect = {
  isActive: true,
  targetUrl: "https://youtube.com/@gauravdoliya"
};

export const getRedirectData = () => {
  try {
    if (fs.existsSync(backendDataFile)) {
      const raw = fs.readFileSync(backendDataFile, "utf-8");
      return JSON.parse(raw);
    }
    if (fs.existsSync(frontendDataFile)) {
      const raw = fs.readFileSync(frontendDataFile, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading redirectConfig.json:", err);
  }
  return defaultRedirect;
};

export const getRedirect = (req, res) => {
  const data = getRedirectData();
  return res.status(200).json({
    success: true,
    data
  });
};

export const updateRedirect = (req, res) => {
  const { targetUrl } = req.body;
  const current = getRedirectData();

  const trimmedUrl = targetUrl !== undefined ? String(targetUrl).trim() : current.targetUrl;
  const isActive = Boolean(trimmedUrl);

  const updated = {
    isActive,
    targetUrl: trimmedUrl
  };

  try {
    const jsonString = JSON.stringify(updated, null, 2);

    // 1. Save to backend/data/redirectConfig.json
    const backendDir = path.dirname(backendDataFile);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    fs.writeFileSync(backendDataFile, jsonString, "utf-8");

    // 2. Save to frontend/src/data/redirectConfig.json
    const frontendDir = path.dirname(frontendDataFile);
    if (fs.existsSync(frontendDir)) {
      fs.writeFileSync(frontendDataFile, jsonString, "utf-8");
    }

    // 3. Save to dist/data/redirectConfig.json if dist exists
    const distDir = path.dirname(distDataFile);
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(distDataFile, jsonString, "utf-8");
    }

    return res.status(200).json({
      success: true,
      message: updated.targetUrl
        ? `Saved! /a is now redirecting to: ${updated.targetUrl}`
        : "Saved! /a is now showing the Coming Soon page.",
      data: updated
    });
  } catch (err) {
    console.error("Failed to save redirect config:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save redirection URL on server"
    });
  }
};
