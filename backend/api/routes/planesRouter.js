import express from "express";
import { listarPlanes, detallePlan, nuevoPlan, misPlanesHandler, listarIntereses } from "../controllers/planesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/planes", verifyToken, listarPlanes);
router.get("/planes/mis-planes", verifyToken, misPlanesHandler);
router.get("/planes/:id", detallePlan);
router.post("/planes", verifyToken, upload.array("fotos", 5), nuevoPlan);
router.get("/intereses", listarIntereses);

export default router;
