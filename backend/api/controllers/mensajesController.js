import { getConversaciones, getMensajesBySolicitud, enviarMensaje } from "../models/mensajesModel.js";

export async function conversaciones(req, res, next) {
  try {
    const rows = await getConversaciones(req.id);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function mensajesDeSolicitud(req, res, next) {
  try {
    const rows = await getMensajesBySolicitud(req.params.id_solicitud);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function enviar(req, res, next) {
  try {
    const id_emisor = req.id;
    const { id_solicitud, mensaje } = req.body;
    if (!id_solicitud || !mensaje) {
      return res.status(400).json({ message: 'Faltan campos' });
    }
    const result = await enviarMensaje(id_solicitud, id_emisor, mensaje);
    return res.status(201).json({ message: 'Mensaje enviado', id: result.insertId });
  } catch (err) {
    next(err);
  }
}
