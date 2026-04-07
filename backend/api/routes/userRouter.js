import { login, register, ActualizarUbicacionUser, VerificarSesion, getPerfil, subirFoto, actualizarDescripcion } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.put("/actualizarubicacion", verifyToken, ActualizarUbicacionUser);
router.get('/verificar-sesion', verifyToken, VerificarSesion);

// Profile
router.get('/perfil', verifyToken, getPerfil);
router.post('/perfil/foto', verifyToken, upload.single('foto'), subirFoto);
router.put('/perfil/descripcion', verifyToken, actualizarDescripcion);

export default router;