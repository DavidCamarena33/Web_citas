import express from "express";
import { solicitar, solicitudesDePlan, misSolicitudes, responderSolicitud } from "../controllers/solicitudesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/solicitudes", verifyToken, solicitar);
router.get("/solicitudes/mis-solicitudes", verifyToken, misSolicitudes);
router.get("/solicitudes/plan/:id_plan", verifyToken, solicitudesDePlan);
router.put("/solicitudes/:id", verifyToken, responderSolicitud);

export default router;
