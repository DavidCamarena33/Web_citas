import connection from "../config/db.js";

export async function crearNotificacion(id_usuario, id_solicitud, tipo) {
  const [result] = await connection.query(
    `INSERT INTO notificaciones (id_usuario, id_solicitud, tipo) VALUES (?, ?, ?)`,
    [id_usuario, id_solicitud, tipo]
  );
  return result;
}

export async function getNotificacionesUsuario(id_usuario) {
  const [rows] = await connection.query(
    `SELECT n.id,
            n.tipo,
            n.fecha_creacion,
            n.id_solicitud,
            s.id_plan,
            p.titulo AS plan_titulo,
            host.nombre AS host_nombre,
            solicitante.nombre AS solicitante_nombre
     FROM notificaciones n
     JOIN solicitudes s ON s.id = n.id_solicitud
     JOIN planes p ON p.id = s.id_plan
     JOIN usuarios host ON host.id = p.id_usuario
     JOIN usuarios solicitante ON solicitante.id = s.id_solicitante
     WHERE n.id_usuario = ?
     ORDER BY n.fecha_creacion DESC, n.id DESC
     LIMIT 25`,
    [id_usuario]
  );
  return rows;
}
