import connection from "../config/db.js";

export async function getConversaciones(id_usuario) {
  const [rows] = await connection.query(
    `WITH accepted_counts AS (
       SELECT s.id_plan, COUNT(*) AS accepted_count
       FROM solicitudes s
       WHERE s.estado = 'aceptada'
       GROUP BY s.id_plan
     ),
     direct_conversations AS (
       SELECT CONCAT('direct-', s.id) AS chat_key,
              'direct' AS chat_type,
              s.id AS solicitud_id,
              p.id AS plan_id,
              p.titulo AS plan_titulo,
              CASE WHEN p.id_usuario = ? THEN u_sol.nombre ELSE u_host.nombre END AS contacto_nombre,
              NULL AS participantes,
              (SELECT m.mensaje
               FROM mensajes m
               WHERE m.id_solicitud = s.id
               ORDER BY m.fecha_creacion DESC, m.id DESC
               LIMIT 1) AS ultimo_mensaje,
              (SELECT m.fecha_creacion
               FROM mensajes m
               WHERE m.id_solicitud = s.id
               ORDER BY m.fecha_creacion DESC, m.id DESC
               LIMIT 1) AS ultima_fecha
       FROM solicitudes s
       JOIN planes p ON p.id = s.id_plan
       JOIN usuarios u_host ON u_host.id = p.id_usuario
       JOIN usuarios u_sol ON u_sol.id = s.id_solicitante
       JOIN accepted_counts ac ON ac.id_plan = s.id_plan
       WHERE s.estado = 'aceptada'
         AND ac.accepted_count = 1
         AND (p.id_usuario = ? OR s.id_solicitante = ?)
     ),
     group_conversations AS (
       SELECT CONCAT('group-', p.id) AS chat_key,
              'group' AS chat_type,
              MIN(s.id) AS solicitud_id,
              p.id AS plan_id,
              p.titulo AS plan_titulo,
              CONCAT('Grupo de ', p.titulo) AS contacto_nombre,
              CONCAT(
                u_host.nombre,
                CASE
                  WHEN COUNT(s.id) > 0 THEN CONCAT(', ', GROUP_CONCAT(DISTINCT u_sol.nombre ORDER BY u_sol.nombre SEPARATOR ', '))
                  ELSE ''
                END
              ) AS participantes,
              (SELECT m.mensaje
               FROM mensajes m
               JOIN solicitudes s2 ON s2.id = m.id_solicitud
               WHERE s2.id_plan = p.id AND s2.estado = 'aceptada'
               ORDER BY m.fecha_creacion DESC, m.id DESC
               LIMIT 1) AS ultimo_mensaje,
              (SELECT m.fecha_creacion
               FROM mensajes m
               JOIN solicitudes s2 ON s2.id = m.id_solicitud
               WHERE s2.id_plan = p.id AND s2.estado = 'aceptada'
               ORDER BY m.fecha_creacion DESC, m.id DESC
               LIMIT 1) AS ultima_fecha
       FROM planes p
       JOIN usuarios u_host ON u_host.id = p.id_usuario
       JOIN solicitudes s ON s.id_plan = p.id AND s.estado = 'aceptada'
       JOIN usuarios u_sol ON u_sol.id = s.id_solicitante
       JOIN accepted_counts ac ON ac.id_plan = p.id
       WHERE ac.accepted_count >= 2
         AND (
           p.id_usuario = ?
           OR EXISTS (
             SELECT 1
             FROM solicitudes sx
             WHERE sx.id_plan = p.id
               AND sx.estado = 'aceptada'
               AND sx.id_solicitante = ?
           )
         )
       GROUP BY p.id, p.titulo, u_host.nombre
     )
     SELECT *
     FROM (
       SELECT * FROM direct_conversations
       UNION ALL
       SELECT * FROM group_conversations
     ) conversaciones
     ORDER BY (ultima_fecha IS NULL), ultima_fecha DESC, plan_id DESC`,
    [id_usuario, id_usuario, id_usuario, id_usuario, id_usuario]
  );
  return rows;
}

export async function getConversationAccess(chatType, referenceId, id_usuario) {
  if (chatType === "group") {
    const [[row]] = await connection.query(
      `SELECT p.id AS plan_id,
              MIN(s.id) AS canonical_solicitud_id
       FROM planes p
       JOIN solicitudes s ON s.id_plan = p.id AND s.estado = 'aceptada'
       WHERE p.id = ?
         AND (
           p.id_usuario = ?
           OR EXISTS (
             SELECT 1
             FROM solicitudes sx
             WHERE sx.id_plan = p.id
               AND sx.estado = 'aceptada'
               AND sx.id_solicitante = ?
           )
         )
       GROUP BY p.id
       HAVING COUNT(s.id) >= 2`,
      [referenceId, id_usuario, id_usuario]
    );
    return row || null;
  }

  const [[row]] = await connection.query(
    `SELECT s.id AS solicitud_id, s.id_plan AS plan_id
     FROM solicitudes s
     JOIN planes p ON p.id = s.id_plan
     WHERE s.id = ?
       AND s.estado = 'aceptada'
       AND (
         p.id_usuario = ?
         OR s.id_solicitante = ?
       )
       AND (
         SELECT COUNT(*)
         FROM solicitudes sx
         WHERE sx.id_plan = s.id_plan
           AND sx.estado = 'aceptada'
       ) = 1`,
    [referenceId, id_usuario, id_usuario]
  );
  return row || null;
}

export async function getMensajesByConversation(chatType, referenceId) {
  const query =
    chatType === "group"
      ? `SELECT m.*, u.nombre AS emisor_nombre
         FROM mensajes m
         JOIN usuarios u ON u.id = m.id_emisor
         JOIN solicitudes s ON s.id = m.id_solicitud
         WHERE s.id_plan = ?
           AND s.estado = 'aceptada'
         ORDER BY m.fecha_creacion ASC, m.id ASC`
      : `SELECT m.*, u.nombre AS emisor_nombre
         FROM mensajes m
         JOIN usuarios u ON u.id = m.id_emisor
         WHERE m.id_solicitud = ?
         ORDER BY m.fecha_creacion ASC, m.id ASC`;

  const [rows] = await connection.query(query, [referenceId]);
  return rows;
}

export async function enviarMensaje(id_solicitud, id_emisor, mensaje) {
  const [result] = await connection.query(
    `INSERT INTO mensajes (id_solicitud, id_emisor, mensaje) VALUES (?, ?, ?)`,
    [id_solicitud, id_emisor, mensaje]
  );
  return result;
}
