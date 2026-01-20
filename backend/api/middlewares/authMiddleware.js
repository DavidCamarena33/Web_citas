import jwt from "jsonwebtoken";
const secretKey = process.env.JWT_SECRET || "paella";

export function verifyToken(req, res, next) {
    const token = req.cookies.galeta;
    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }
    try {
        const payload = jwt.verify(token, secretKey);
        req.id = payload.user.id 
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token not valid" });
    }
}