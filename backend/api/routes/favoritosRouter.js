import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { listarFavoritos, toggleFavorito } from "../controllers/favoritosController.js";

const router = express.Router();

router.get("/favoritos", verifyToken, listarFavoritos);
router.post("/planes/:id/favorito", verifyToken, toggleFavorito);

export default router;
