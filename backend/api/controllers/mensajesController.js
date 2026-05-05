import { getConversaciones, getMensajesByConversation, enviarMensaje, getConversationAccess } from "../models/mensajesModel.js";

export async function conversaciones(req, res, next) {
  try {
    const rows = await getConversaciones(req.id);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

function parseChatKey(chatKey = "") {
  const [chatType, rawId] = String(chatKey).split("-");
  const referenceId = Number(rawId);

  if (!["direct", "group"].includes(chatType) || !Number.isInteger(referenceId) || referenceId <= 0) {
    return null;
  }

  return { chatType, referenceId };
}

export async function mensajesDeSolicitud(req, res, next) {
  try {
    const parsed = parseChatKey(req.params.chat_key);
    if (!parsed) {
      return res.status(400).json({ message: "Chat inválido" });
    }

    const access = await getConversationAccess(parsed.chatType, parsed.referenceId, req.id);
    if (!access) {
      return res.status(403).json({ message: "No autorizado para ver este chat" });
    }

    const rows = await getMensajesByConversation(parsed.chatType, parsed.referenceId);
    return res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function enviar(req, res, next) {
  try {
    const id_emisor = req.id;
    const { chat_key, mensaje } = req.body;
    if (!chat_key || !mensaje) {
      return res.status(400).json({ message: 'Faltan campos' });
    }

    const parsed = parseChatKey(chat_key);
    if (!parsed) {
      return res.status(400).json({ message: "Chat inválido" });
    }

    const access = await getConversationAccess(parsed.chatType, parsed.referenceId, id_emisor);
    if (!access) {
      return res.status(403).json({ message: "No autorizado para escribir en este chat" });
    }

    const targetSolicitudId =
      parsed.chatType === "group"
        ? access.canonical_solicitud_id
        : access.solicitud_id;

    const result = await enviarMensaje(targetSolicitudId, id_emisor, mensaje);
    return res.status(201).json({ message: 'Mensaje enviado', id: result.insertId });
  } catch (err) {
    next(err);
  }
}
