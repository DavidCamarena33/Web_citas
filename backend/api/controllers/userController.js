import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getByEmail, registro } from "../models/userModel.js";

const secretKey = process.env.JWT_SECRET;

export async function login(req, res, next) {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
      return res
        .status(400)
        .json({ message: "Faltan campos: email o contrasena" });
    }
    const users = await getByEmail(email);
    if (users.length === 0) {
      return res.status(400).json({ message: "usuario no encontrado" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: "Contrasena incorrecta" });
    }

    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
    res.cookie("cookie", token, {
      httpOnly: true,
      maxAge: 3600000,
    });
    return res.status(200).json({ message: "Autenticacion correcta" });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { nombre, email, edad, contrasena, genero, orientacion } = req.body;
    if (!email || !contrasena || !nombre || !edad || !contrasena|| !genero|| !orientacion) {
      return res
        .status(400)
        .json({ message: "Faltan campos" });
    }
    const id = await registro(nombre, email, edad, contrasena, genero, orientacion);

    if (id.affectedRows > 0) {
      return res.status(201).json({ message: "Usuario registrado" });
    }
  } catch (err) {
    next(err);
  }
}
