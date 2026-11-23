
import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// ==========================================
// ADMIN / STUDENT / TEACHER LOGIN
// ==========================================

router.post("/login", login);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;
