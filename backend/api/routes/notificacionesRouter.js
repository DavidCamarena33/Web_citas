import express from "express";
import { listarNotificaciones } from "../controllers/notificacionesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/notificaciones", verifyToken, listarNotificaciones);

export default router;
