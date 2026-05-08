import { login, logout, register, ActualizarUbicacionUser, VerificarSesion, getPerfil, getPlanesHostedByUser, subirFoto, actualizarFotoPrincipal, actualizarDescripcion } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.put("/actualizarubicacion", verifyToken, ActualizarUbicacionUser);
router.get('/verificar-sesion', verifyToken, VerificarSesion);

// Profile
router.get('/perfil', verifyToken, getPerfil);
router.get('/perfil/:id', verifyToken, getPerfil);
router.get('/perfil/:id/planes', verifyToken, getPlanesHostedByUser);
router.post('/perfil/foto', verifyToken, upload.single('foto'), subirFoto);
router.put('/perfil/foto-principal', verifyToken, upload.single('foto'), actualizarFotoPrincipal);
router.put('/perfil/descripcion', verifyToken, actualizarDescripcion);

export default router;
