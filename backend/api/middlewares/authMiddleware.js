import jwt from "jsonwebtoken";
const secretKey = process.env.JWT_SECRET;

export function verifyToken(req, res, next) {
    const token = req.cookies.cookie;
    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }
    try {
        const payload = jwt.verify(token, secretKey);
        req.correu = payload.correu;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token not valid" });
    }
}