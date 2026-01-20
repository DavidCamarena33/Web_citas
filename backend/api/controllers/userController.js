import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import "dotenv/config";
import { getByEmail, registro, ubicacionuser } from "../models/userModel.js";

const secretKey = process.env.JWT_SECRET || "paella";

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

    const token = jwt.sign({ user }, secretKey, { expiresIn: "1h" });
    res.cookie("galeta", token, {
      httpOnly: true,
      maxAge: 3600000,
    });

    const { id, emailuser, nombre, direccion } = user;
    return res.status(200).json({ message: "Autenticacion correcta", user:{ id, emailuser, nombre, direccion } });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { nombre, email, edad, contrasena, genero, orientacion } = req.body;
    if (!email || !contrasena || !nombre || !edad || !genero|| !orientacion) {
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

export async function ActualizarUbicacionUser(req, res, next){
  try {
    const id_usuario = req.id;
    const { direccion, longitud, latitud } = req.body;
    if ( !direccion || !longitud || !latitud ) {
      return res
        .status(400)
        .json({ message: "Faltan campos" });
    }
    const id = await ubicacionuser(direccion, longitud, latitud, id_usuario);

    if (id.affectedRows > 0) {
      return res.status(201).json({ message: "Ubicacion del usuario registrada" });
    }
  } catch (err) {
    next(err);
  }
}

export const VerificarSesion = async (req, res) => {
    try {
        const token = req.cookies.galeta;

        if (!token) {
            return res.status(401).json({ auth: false });
        }

        const decoded = jwt.verify(token, secretKey); 

        return res.status(200).json({ auth: true, user: decoded });

    } catch (error) {
        return res.status(401).json({ auth: false });
    }
}
