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

export async function getPlanes({
  lat,
  lng,
  radio = null,
  excludeUserId = null,
  hostOrientation = null,
  capacityMode = null,
  fechaDesde = null,
  fechaHasta = null,
} = {}) {
  const conditions = [];
  const params = [];

  if (excludeUserId) {
    conditions.push("p.id_usuario <> ?");
    params.push(excludeUserId);
  }

  if (hostOrientation) {
    conditions.push("u.orientacion = ?");
    params.push(hostOrientation);
  }

  if (capacityMode === "pareja") {
    conditions.push("p.max_asistentes = 2");
  }

  if (capacityMode === "grupo") {
    conditions.push("p.max_asistentes > 2");
  }

  if (lat && lng && radio) {
    conditions.push(
      "(6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(p.lat)) * COS(RADIANS(p.lng) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(p.lat)))) <= ?"
    );
    params.push(Number(lat), Number(lng), Number(lat), Number(radio));
  }

  if (fechaDesde) {
    conditions.push("(p.fecha_plan IS NULL OR p.fecha_plan >= ?)");
    params.push(fechaDesde);
  } else if (fechaHasta) {
    conditions.push("(p.fecha_plan IS NULL OR p.fecha_plan >= NOW())");
    conditions.push("(p.fecha_plan IS NULL OR p.fecha_plan <= ?)");
    params.push(fechaHasta);
  } else {
    conditions.push("(p.fecha_plan IS NULL OR p.fecha_plan >= NOW())");
  }

  if (fechaDesde && fechaHasta) {
    conditions.push("(p.fecha_plan IS NULL OR p.fecha_plan <= ?)");
    params.push(fechaHasta);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await connection.query(
    `SELECT p.id, p.titulo, p.descripcion, p.max_asistentes, p.lat, p.lng, p.fecha_plan, p.fecha_creacion,
            u.nombre AS host_nombre, u.id AS host_id, u.genero AS host_genero, u.orientacion AS host_orientacion,
            (SELECT fp.url FROM fotos_planes fp WHERE fp.id_plan = p.id ORDER BY fp.orden LIMIT 1) AS foto,
            i.nombre AS interes, i.categoria,
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_plan = p.id AND s.estado = 'aceptada') AS spots_filled,
            (SELECT ROUND(AVG(vp.puntuacion), 1) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS average_rating,
            (SELECT COUNT(*) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS ratings_count
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
            (SELECT COUNT(*) FROM solicitudes s WHERE s.id_plan = p.id AND s.estado = 'aceptada') AS spots_filled,
            (SELECT ROUND(AVG(vp.puntuacion), 1) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS average_rating,
            (SELECT COUNT(*) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS ratings_count
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
            (SELECT ROUND(AVG(vp.puntuacion), 1) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS average_rating,
            (SELECT COUNT(*) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS ratings_count,
            'hosting' AS tipo
     FROM planes p
     JOIN intereses i ON i.id = p.id_interes
     WHERE p.id_usuario = ?
     UNION ALL
     SELECT p.id, p.titulo, p.descripcion, p.max_asistentes, p.lat, p.lng, p.fecha_plan,
            (SELECT fp.url FROM fotos_planes fp WHERE fp.id_plan = p.id ORDER BY fp.orden LIMIT 1) AS foto,
            i.nombre AS interes,
            (SELECT COUNT(*) FROM solicitudes s2 WHERE s2.id_plan = p.id AND s2.estado = 'aceptada') AS spots_filled,
            (SELECT ROUND(AVG(vp.puntuacion), 1) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS average_rating,
            (SELECT COUNT(*) FROM valoraciones_planes vp WHERE vp.id_plan = p.id) AS ratings_count,
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

export async function getPlanRatingSummary(id_plan) {
  const [[row]] = await connection.query(
    `SELECT
      ROUND(AVG(puntuacion), 1) AS average_rating,
      COUNT(*) AS ratings_count
     FROM valoraciones_planes
     WHERE id_plan = ?`,
    [id_plan]
  );
  return row || { average_rating: null, ratings_count: 0 };
}

export async function getPlanRatingByUser(id_plan, id_usuario) {
  const [[row]] = await connection.query(
    `SELECT puntuacion, comentario, fecha_creacion
     FROM valoraciones_planes
     WHERE id_plan = ? AND id_usuario = ?`,
    [id_plan, id_usuario]
  );
  return row || null;
}

export async function canUserRatePlan(id_plan, id_usuario) {
  const [[row]] = await connection.query(
    `SELECT p.fecha_plan
     FROM solicitudes s
     JOIN planes p ON p.id = s.id_plan
     WHERE s.id_plan = ?
       AND s.id_solicitante = ?
       AND s.estado = 'aceptada'
       AND p.fecha_plan IS NOT NULL
     LIMIT 1`,
    [id_plan, id_usuario]
  );

  if (!row?.fecha_plan) return false;

  const planDate = new Date(row.fecha_plan);
  return !Number.isNaN(planDate.getTime()) && planDate < new Date();
}

export async function upsertPlanRating(id_plan, id_usuario, puntuacion, comentario) {
  const [result] = await connection.query(
    `INSERT INTO valoraciones_planes (id_plan, id_usuario, puntuacion, comentario)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       puntuacion = VALUES(puntuacion),
       comentario = VALUES(comentario)`,
    [id_plan, id_usuario, puntuacion, comentario || null]
  );
  return result;
}

export async function getIntereses() {
  const [rows] = await connection.query(`SELECT * FROM intereses ORDER BY categoria, nombre`);
  return rows;
}
