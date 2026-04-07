import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { errores } from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRouter.js";
import planesRoutes from "./routes/planesRouter.js";
import solicitudesRoutes from "./routes/solicitudesRouter.js";
import mensajesRoutes from "./routes/mensajesRouter.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', userRoutes);
app.use('/api', planesRoutes);
app.use('/api', solicitudesRoutes);
app.use('/api', mensajesRoutes);
app.use(errores);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
