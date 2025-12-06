const { poolPromise } = require("../config/db.js");

exports.obtenerAccesorios = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        id_producto AS id,
        descripcion AS nombre,
        stock,
        precio
      FROM ACCESORIOS
      ORDER BY descripcion;
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error obteniendo accesorios:", err);
    res.status(500).json({ error: "Error obteniendo accesorios" });
  }
};

exports.obtenerTejidos = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        id_producto AS id,
        descripcion + ' ' + cal + ' ' + pul + ' ' + alt + ' ' + long AS nombre,
        stock,
        precio
      FROM TEJIDOS
      ORDER BY descripcion;
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error obteniendo tejidos:", err);
    res.status(500).json({ error: "Error obteniendo tejidos" });
  }
};
