import express from "express";
import { getRedirect, updateRedirect } from "../controllers/redirectController.js";

const router = express.Router();

router.get("/", getRedirect);
router.post("/", updateRedirect);

export default router;
