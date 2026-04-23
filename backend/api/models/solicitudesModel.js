import connection from "../config/db.js";

export async function crearSolicitud(id_plan, id_solicitante, mensaje) {
  const [result] = await connection.query(
    `INSERT INTO solicitudes (id_plan, id_solicitante, mensaje) VALUES (?, ?, ?)`,
    [id_plan, id_solicitante, mensaje || '']
  );
  return result;
}

export async function getSolicitudesPlan(id_plan) {
  const [rows] = await connection.query(
    `SELECT s.*, u.nombre AS solicitante_nombre
     FROM solicitudes s
     JOIN usuarios u ON u.id = s.id_solicitante
     WHERE s.id_plan = ? AND s.estado = 'pendiente'
     ORDER BY s.fecha_creacion DESC`,
    [id_plan]
  );
  return rows;
}

export async function getSolicitudById(id) {
  const [[row]] = await connection.query(
    `SELECT * FROM solicitudes WHERE id = ?`,
    [id]
  );
  return row || null;
}

export async function getMisSolicitudes(id_usuario) {
  const [rows] = await connection.query(
    `SELECT s.*, p.titulo AS plan_titulo, u.nombre AS host_nombre
     FROM solicitudes s
     JOIN planes p ON p.id = s.id_plan
     JOIN usuarios u ON u.id = p.id_usuario
     WHERE p.id_usuario = ?
     ORDER BY s.fecha_creacion DESC`,
    [id_usuario]
  );
  return rows;
}

export async function getCupoPlan(id_plan) {
  const [[plan]] = await connection.query(
    `SELECT p.max_asistentes, p.id_usuario,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_plan = p.id AND s.estado = 'aceptada') AS aceptadas
     FROM planes p
     WHERE p.id = ?`,
    [id_plan]
  );
  return plan || null;
}

export async function actualizarEstado(id, estado) {
  const [result] = await connection.query(
    `UPDATE solicitudes SET estado = ? WHERE id = ?`,
    [estado, id]
  );
  return result;
}
