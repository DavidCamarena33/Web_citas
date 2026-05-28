import express from "express";
import { conversaciones, mensajesDeSolicitud, enviar } from "../controllers/mensajesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/mensajes/conversaciones", verifyToken, conversaciones);
router.get("/mensajes/:chat_key", verifyToken, mensajesDeSolicitud);
router.post("/mensajes", verifyToken, enviar);

export default router;
