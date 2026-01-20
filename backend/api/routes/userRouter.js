import { login, register, ActualizarUbicacionUser, VerificarSesion } from "../controllers/userController.js";
import {verifyToken} from "../middlewares/authMiddleware.js"
import express from "express";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.put("/actualizarubicacion", verifyToken,  ActualizarUbicacionUser);

router.get('/verificar-sesion',verifyToken, VerificarSesion);

export default router;