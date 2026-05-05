import jwt from "jsonwebtoken";
import { getById } from "../models/userModel.js";
const secretKey = process.env.JWT_SECRET || "paella";

export async function verifyToken(req, res, next) {
    const token = req.cookies.galeta;
    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }
    try {
        const payload = jwt.verify(token, secretKey);
        const userId = Number(payload?.user?.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            res.clearCookie("galeta", { httpOnly: true });
            return res.status(401).json({ message: "Token not valid" });
        }

        const user = await getById(userId);
        if (!user) {
            res.clearCookie("galeta", { httpOnly: true });
            return res.status(401).json({ message: "Sesion invalida. Vuelve a iniciar sesion" });
        }

        req.id = user.id;
        req.user = user;
        next();
    } catch (error) {
        res.clearCookie("galeta", { httpOnly: true });
        return res.status(403).json({ message: "Token not valid" });
    }
}
