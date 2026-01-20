import mysql from 'mysql2/promise';
let connection;

try {
  connection = await mysql.createConnection({
    host: '127.0.0.1', 
    user: 'root',
    password: 'root',
    database: 'citas_db',
    port: 3306 
  });
  console.log("✅ Conexión exitosa a la base de datos");
} catch (error) {
  console.error("❌ Error conectando a la base de datos:", error.message);
}

export default connection;