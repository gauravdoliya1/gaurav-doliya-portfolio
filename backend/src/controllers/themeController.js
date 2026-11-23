import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDataFile = path.resolve(__dirname, "../../data/theme.json");
const frontendDataFile = path.resolve(__dirname, "../../../frontend/src/data/theme.json");

const defaultTheme = {
  primaryColor: "#de4528",
  backgroundColor: "#0c0706",
  textColor: "#ffffff",
  grayColor: "#58687e"
};

const getThemeData = () => {
  try {
    if (fs.existsSync(backendDataFile)) {
      const raw = fs.readFileSync(backendDataFile, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading backend theme.json:", err);
  }
  return defaultTheme;
};

export const getTheme = (req, res) => {
  const data = getThemeData();
  return res.status(200).json({
    success: true,
    data
  });
};

export const updateTheme = (req, res) => {
  const { primaryColor, backgroundColor, textColor, grayColor } = req.body;

  const current = getThemeData();
  const updated = {
    primaryColor: primaryColor ? primaryColor.trim() : current.primaryColor,
    backgroundColor: backgroundColor ? backgroundColor.trim() : current.backgroundColor,
    textColor: textColor ? textColor.trim() : current.textColor,
    grayColor: grayColor ? grayColor.trim() : (current.grayColor || "#58687e")
  };

  try {
    const jsonString = JSON.stringify(updated, null, 2);

    const backendDir = path.dirname(backendDataFile);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    fs.writeFileSync(backendDataFile, jsonString, "utf-8");

    const frontendDir = path.dirname(frontendDataFile);
    if (fs.existsSync(frontendDir)) {
      fs.writeFileSync(frontendDataFile, jsonString, "utf-8");
    }

    return res.status(200).json({
      success: true,
      message: "Website colors updated successfully!",
      data: updated
    });
  } catch (err) {
    console.error("Failed to save theme colors:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save theme colors on server"
    });
  }
};
