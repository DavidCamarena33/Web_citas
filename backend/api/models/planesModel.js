import connection from "../config/db.js";

export async function crearPlan(id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan) {
  const [result] = await connection.query(
    `INSERT INTO planes (id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_usuario, id_interes, titulo, descripcion, max_asistentes, lat, lng, fecha_plan || null]
  );
  return result;
}

export async function guardarFotosPlan(id_plan, urls) {
  for (let i = 0; i < urls.length; i++) {
    await connection.query(
      `INSERT INTO fotos_planes (id_plan, url, orden) VALUES (?, ?, ?)`,
      [id_plan, urls[i], i]
    );
  }
}

export async function getPlanes({ lat, lng, radio = 50, excludeUserId = null } = {}) {
  const whereClause = excludeUserId ? "WHERE p.id_usuario <> ?" : "";
  const params = excludeUserId ? [excludeUserId] : [];

  const [rows] = await connection.query(
    `SELECT p.id, p.titulo, p.descripcion, p.max_asistentes, p.lat, p.lng, p.fecha_plan, p.fecha_creacion,
            u.nombre AS host_nombre,
            (SELECT fp.url FROM fotos_planes fp WHERE fp.id_plan = p.id ORDER BY fp.orden LIMIT 1) AS foto,
            i.nombre AS interes, i.categoria,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_plan = p.id AND s.estado = 'aceptada') AS spots_filled
     FROM planes p
     JOIN usuarios u ON u.id = p.id_usuario
     JOIN intereses i ON i.id = p.id_interes
     ${whereClause}
     ORDER BY p.fecha_creacion DESC`
    ,
    params
  );
  return rows;
}

export async function getPlanById(id) {
  const [[plan]] = await connection.query(
    `SELECT p.*, u.nombre AS host_nombre, u.id AS host_id,
            i.nombre AS interes, i.categoria,
            (SELECT fp.url FROM fotos_planes fp WHERE fp.id_plan = p.id ORDER BY fp.orden LIMIT 1) AS foto,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_plan = p.id AND s.estado = 'aceptada') AS spots_filled
     FROM planes p
     JOIN usuarios u ON u.id = p.id_usuario
     JOIN intereses i ON i.id = p.id_interes
     WHERE p.id = ?`,
    [id]
  );
  if (!plan) return null;

  const [fotos] = await connection.query(
    `SELECT url FROM fotos_planes WHERE id_plan = ? ORDER BY orden`,
    [id]
  );
  plan.fotos = fotos.map(f => f.url);
  return plan;
}

export async function getPlanesByUsuario(id_usuario) {
  const [rows] = await connection.query(
    `SELECT p.id, p.titulo, p.descripcion, p.max_asistentes, p.lat, p.lng, p.fecha_plan,
            (SELECT fp.url FROM fotos_planes fp WHERE fp.id_plan = p.id ORDER BY fp.orden LIMIT 1) AS foto,
            i.nombre AS interes,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_plan = p.id AND s.estado = 'aceptada') AS spots_filled,
            'hosting' AS tipo
     FROM planes p
     JOIN intereses i ON i.id = p.id_interes
     WHERE p.id_usuario = ?
     UNION ALL
     SELECT p.id, p.titulo, p.descripcion, p.max_asistentes, p.lat, p.lng, p.fecha_plan,
            (SELECT fp.url FROM fotos_planes fp WHERE fp.id_plan = p.id ORDER BY fp.orden LIMIT 1) AS foto,
            i.nombre AS interes,
            (SELECT COUNT(*) FROM solicitudes s2 WHERE s2.id_plan = p.id AND s2.estado = 'aceptada') AS spots_filled,
            s.estado AS tipo
     FROM solicitudes s
     JOIN planes p ON p.id = s.id_plan
     JOIN intereses i ON i.id = p.id_interes
     WHERE s.id_solicitante = ?
     ORDER BY fecha_plan ASC`,
    [id_usuario, id_usuario]
  );
  return rows;
}

export async function getIntereses() {
  const [rows] = await connection.query(`SELECT * FROM intereses ORDER BY categoria, nombre`);
  return rows;
}
