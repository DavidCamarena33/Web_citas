import { getNotificacionesUsuario } from "../models/notificacionesModel.js";

export async function listarNotificaciones(req, res, next) {
  try {
    const rows = await getNotificacionesUsuario(req.id);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
