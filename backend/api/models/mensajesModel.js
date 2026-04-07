import connection from "../config/db.js";

export async function getConversaciones(id_usuario) {
  const [rows] = await connection.query(
    `SELECT s.id AS solicitud_id, s.estado,
            p.titulo AS plan_titulo,
            CASE WHEN p.id_usuario = ? THEN u_sol.nombre ELSE u_host.nombre END AS contacto_nombre,
            (SELECT m.mensaje FROM mensajes m WHERE m.id_solicitud = s.id ORDER BY m.fecha_creacion DESC LIMIT 1) AS ultimo_mensaje,
            (SELECT m.fecha_creacion FROM mensajes m WHERE m.id_solicitud = s.id ORDER BY m.fecha_creacion DESC LIMIT 1) AS ultima_fecha
     FROM solicitudes s
     JOIN planes p ON p.id = s.id_plan
     JOIN usuarios u_host ON u_host.id = p.id_usuario
     JOIN usuarios u_sol ON u_sol.id = s.id_solicitante
     WHERE (p.id_usuario = ? OR s.id_solicitante = ?) AND s.estado = 'aceptada'
     ORDER BY ultima_fecha DESC`,
    [id_usuario, id_usuario, id_usuario]
  );
  return rows;
}

export async function getMensajesBySolicitud(id_solicitud) {
  const [rows] = await connection.query(
    `SELECT m.*, u.nombre AS emisor_nombre
     FROM mensajes m
     JOIN usuarios u ON u.id = m.id_emisor
     WHERE m.id_solicitud = ?
     ORDER BY m.fecha_creacion ASC`,
    [id_solicitud]
  );
  return rows;
}

export async function enviarMensaje(id_solicitud, id_emisor, mensaje) {
  const [result] = await connection.query(
    `INSERT INTO mensajes (id_solicitud, id_emisor, mensaje) VALUES (?, ?, ?)`,
    [id_solicitud, id_emisor, mensaje]
  );
  return result;
}
