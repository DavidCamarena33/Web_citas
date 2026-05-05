import connection from "../config/db.js";
import bcrypt from "bcrypt";

export const getByEmail = async (email) => {
  const [results] = await connection.query(
    "SELECT * FROM usuarios where email=?",
    [email],
  );
  return results;
};

export const getById = async (id) => {
  const [[user]] = await connection.query(
    "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
    [id],
  );
  return user || null;
};

export async function registro(nombre, email, edad ,contrasena, genero, orientacion) {
  const hashPass = await bcrypt.hash(contrasena, 10);

  const [results] = await connection.query(
    "insert into usuarios (nombre, email, edad, contrasena, genero, orientacion) values(?,?,?,?,?,?)",
    [nombre, email,edad, hashPass, genero, orientacion],
  );
  return results;
}

export async function ubicacionuser(direccion, longitud, latitud, id) {
  const [actualizarubicacion] = await connection.query(
    "update usuarios set direccion = ?, lng = ?, lat = ? where id = ?",
    [direccion, longitud, latitud, id]
  );
  return actualizarubicacion;
}

export async function getPerfilById(id) {
  const [[user]] = await connection.query(
    `SELECT id, nombre, email, edad, genero, orientacion, descripcion, direccion, lat, lng, fecha_creacion
     FROM usuarios WHERE id = ?`,
    [id]
  );
  if (!user) return null;

  const [fotos] = await connection.query(
    `SELECT url FROM fotos_usuarios WHERE id_usuario = ? ORDER BY orden`,
    [id]
  );
  user.fotos = fotos.map(f => f.url);

  const [stats] = await connection.query(
    `SELECT
      (SELECT COUNT(*) FROM planes WHERE id_usuario = ?) AS planes_hosted,
      (SELECT COUNT(*) FROM solicitudes WHERE id_solicitante = ? AND estado = 'aceptada') AS planes_joined`,
    [id, id]
  );
  user.stats = stats[0];
  return user;
}

export async function subirFotoUsuario(id_usuario, filename) {
  const orden_max_result = await connection.query(
    `SELECT COALESCE(MAX(orden), -1) + 1 AS next_orden FROM fotos_usuarios WHERE id_usuario = ?`,
    [id_usuario]
  );
  const next_orden = orden_max_result[0][0].next_orden;
  const [result] = await connection.query(
    `INSERT INTO fotos_usuarios (id_usuario, url, orden) VALUES (?, ?, ?)`,
    [id_usuario, filename, next_orden]
  );
  return result;
}

export async function actualizarFotoPrincipalUsuario(id_usuario, filename) {
  const [[fotoPrincipal]] = await connection.query(
    `SELECT id FROM fotos_usuarios WHERE id_usuario = ? ORDER BY orden ASC LIMIT 1`,
    [id_usuario]
  );

  if (fotoPrincipal) {
    const [result] = await connection.query(
      `UPDATE fotos_usuarios SET url = ? WHERE id = ?`,
      [filename, fotoPrincipal.id]
    );
    return result;
  }

  const [result] = await connection.query(
    `INSERT INTO fotos_usuarios (id_usuario, url, orden) VALUES (?, ?, 0)`,
    [id_usuario, filename]
  );
  return result;
}

export async function updateDescripcion(id, descripcion) {
  const [result] = await connection.query(
    `UPDATE usuarios SET descripcion = ? WHERE id = ?`,
    [descripcion, id]
  );
  return result;
}

export async function eliminarFotoUsuario(id_usuario, filename) {
  const [result] = await connection.query(
    `DELETE FROM fotos_usuarios WHERE id_usuario = ? AND url = ?`,
    [id_usuario, filename]
  );
  return result;
}
