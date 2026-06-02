import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { errores } from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRouter.js";
import planesRoutes from "./routes/planesRouter.js";
import solicitudesRoutes from "./routes/solicitudesRouter.js";
import mensajesRoutes from "./routes/mensajesRouter.js";
import favoritosRoutes from "./routes/favoritosRouter.js";
import notificacionesRoutes from "./routes/notificacionesRouter.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
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
app.use('/api', favoritosRoutes);
app.use('/api', notificacionesRoutes);
app.use(errores);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
