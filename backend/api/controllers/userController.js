import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import "dotenv/config";
import { getByEmail, registro, ubicacionuser, getPerfilById, getHostedPlansByUserId, subirFotoUsuario, actualizarFotoPrincipalUsuario, updateDescripcion } from "../models/userModel.js";

const secretKey = process.env.JWT_SECRET || "paella";
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function toPublicPhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  if (photoUrl.startsWith('/uploads/')) return `${BASE_URL}${photoUrl}`;
  return `${BASE_URL}/uploads/${photoUrl}`;
}

export async function login(req, res, next) {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
      return res.status(400).json({ message: "Faltan campos: email o contrasena" });
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
    res.cookie("galeta", token, { httpOnly: true, maxAge: 3600000 });

    const { id, emailuser, nombre, direccion } = user;
    return res.status(200).json({ message: "Autenticacion correcta", user: { id, emailuser, nombre, direccion } });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { nombre, email, edad, contrasena, genero, orientacion } = req.body;
    if (!email || !contrasena || !nombre || !edad || !genero || !orientacion) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    const id = await registro(nombre, email, edad, contrasena, genero, orientacion);
    if (id.affectedRows > 0) {
      return res.status(201).json({ message: "Usuario registrado" });
    }
  } catch (err) {
    next(err);
  }
}

export async function ActualizarUbicacionUser(req, res, next) {
  try {
    const id_usuario = req.id;
    const { direccion, longitud, latitud } = req.body;
    if (!direccion || !longitud || !latitud) {
      return res.status(400).json({ message: "Faltan campos" });
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
    if (!token) return res.status(401).json({ auth: false });
    const decoded = jwt.verify(token, secretKey);
    return res.status(200).json({ auth: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ auth: false });
  }
};

export async function getPerfil(req, res, next) {
  try {
    const profileId = Number(req.params.id || req.id);
    const perfil = await getPerfilById(profileId);
    if (!perfil) return res.status(404).json({ message: 'Usuario no encontrado' });
    perfil.fotos = perfil.fotos.map(toPublicPhotoUrl).filter(Boolean);
    return res.status(200).json(perfil);
  } catch (err) {
    next(err);
  }
}

export async function getPlanesHostedByUser(req, res, next) {
  try {
    const profileId = Number(req.params.id);
    if (!profileId) {
      return res.status(400).json({ message: 'Id de usuario no válido' });
    }

    const planes = await getHostedPlansByUserId(profileId);
    const planesConFoto = planes.map((plan) => ({
      ...plan,
      foto: plan.foto ? `${BASE_URL}/uploads/${plan.foto.split('/').pop()}` : null,
    }));
    return res.status(200).json(planesConFoto);
  } catch (err) {
    next(err);
  }
}

export async function subirFoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se subio ningun archivo' });
    const principal = req.body?.principal === 'true' || req.body?.principal === true;
    if (principal) {
      await actualizarFotoPrincipalUsuario(req.id, req.file.filename);
    } else {
      await subirFotoUsuario(req.id, req.file.filename);
    }
    return res.status(201).json({
      message: 'Foto subida',
      url: toPublicPhotoUrl(req.file.filename),
      principal
    });
  } catch (err) {
    next(err);
  }
}

export async function actualizarFotoPrincipal(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' });
    await actualizarFotoPrincipalUsuario(req.id, req.file.filename);
    return res.status(200).json({
      message: 'Foto principal actualizada',
      url: `${BASE_URL}/uploads/${req.file.filename}`
    });
  } catch (err) {
    next(err);
  }
}

export async function actualizarDescripcion(req, res, next) {
  try {
    const { descripcion } = req.body;
    await updateDescripcion(req.id, descripcion);
    return res.status(200).json({ message: 'Descripcion actualizada' });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie("galeta", { httpOnly: true });
    return res.status(200).json({ message: "Sesion cerrada" });
  } catch (err) {
    next(err);
  }
}
