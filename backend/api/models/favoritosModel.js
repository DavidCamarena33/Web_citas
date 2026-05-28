import connection from "../config/db.js";

export async function getFavoritosByUsuario(id_usuario) {
  const [rows] = await connection.query(
    `SELECT id_plan
     FROM favoritos
     WHERE id_usuario = ?`,
    [id_usuario]
  );
  return rows;
}

export async function existeFavorito(id_usuario, id_plan) {
  const [[row]] = await connection.query(
    `SELECT id
     FROM favoritos
     WHERE id_usuario = ? AND id_plan = ?`,
    [id_usuario, id_plan]
  );
  return row || null;
}

export async function crearFavorito(id_usuario, id_plan) {
  const [result] = await connection.query(
    `INSERT INTO favoritos (id_usuario, id_plan)
     VALUES (?, ?)`,
    [id_usuario, id_plan]
  );
  return result;
}

export async function eliminarFavorito(id_usuario, id_plan) {
  const [result] = await connection.query(
    `DELETE FROM favoritos
     WHERE id_usuario = ? AND id_plan = ?`,
    [id_usuario, id_plan]
  );
  return result;
}
