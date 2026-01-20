import connection from "../config/db.js";
import bcrypt from "bcryptjs";

export const getByEmail = async (email) => {
  const [results] = await connection.query(
    "SELECT * FROM usuarios where email=?",
    [email],
  );
  return results;
};

export async function registro(nombre, email, edad ,contrasena, genero, orientacion) {
  const hashPass = await bcrypt.hash(contrasena, 10);

  const [results] = await connection.query(
    "insert into usuarios (nombre, email, fecha_nacimiento, contrasena, genero, orientacion) values(?,?,?,?,?,?)",
    [nombre, email,edad, hashPass, genero, orientacion],
  );
  return results;
}
