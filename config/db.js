const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("✔ SQL Server conectado");
    return pool;
  })
  .catch((err) => {
    console.error("❌ Error conectando SQL:", err);
  });

module.exports = { sql, poolPromise };
