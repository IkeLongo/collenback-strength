import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
// dotenv.config({ path: './.env.local' });

// console.log("DB Config:", {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER || "MISSING",
//   password: process.env.DB_PASS ? "*****" : "MISSING",
//   database: process.env.DB_SCHEMA || "MISSING"
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
