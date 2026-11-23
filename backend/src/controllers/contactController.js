import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDataFile = path.resolve(__dirname, "../../data/contact.json");
const frontendDataFile = path.resolve(__dirname, "../../../frontend/src/data/contact.json");

const defaultContact = {
  email: "gauravdoliya.fxwork@gmail.com",
  phone: "+91 83830 43341",
  whatsapp: "918383043341",
  linkedin: "https://www.linkedin.com/in/gauravdoliya",
  location: "New Delhi, India"
};

const getContactData = () => {
  try {
    if (fs.existsSync(backendDataFile)) {
      const raw = fs.readFileSync(backendDataFile, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading backend contact.json:", err);
  }
  return defaultContact;
};

export const getContact = (req, res) => {
  const data = getContactData();
  return res.status(200).json({
    success: true,
    data
  });
};

export const updateContact = (req, res) => {
  const { email, phone, whatsapp, linkedin, location } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email address is required"
    });
  }

  const current = getContactData();
  const updated = {
    email: email.trim(),
    phone: phone !== undefined ? phone.trim() : current.phone,
    whatsapp: whatsapp !== undefined ? whatsapp.replace(/[^0-9]/g, "") : current.whatsapp,
    linkedin: linkedin !== undefined ? linkedin.trim() : current.linkedin,
    location: location !== undefined ? location.trim() : current.location
  };

  try {
    const jsonString = JSON.stringify(updated, null, 2);

    // Save to backend data file
    const backendDir = path.dirname(backendDataFile);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    fs.writeFileSync(backendDataFile, jsonString, "utf-8");

    // Automatically sync to frontend data folder
    const frontendDir = path.dirname(frontendDataFile);
    if (fs.existsSync(frontendDir)) {
      fs.writeFileSync(frontendDataFile, jsonString, "utf-8");
    }

    return res.status(200).json({
      success: true,
      message: "Contact details updated successfully!",
      data: updated
    });
  } catch (err) {
    console.error("Failed to save contact details:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save contact details on server"
    });
  }
};
