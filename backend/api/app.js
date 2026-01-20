import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { errores } from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true                
}));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.use(errores());
app.use(express.json());
app.use(cookieParser());

app.use('/api', userRoutes);




