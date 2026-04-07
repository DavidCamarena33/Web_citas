import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'citas_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión exitosa a la base de datos');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err.message);
  });

export default pool;