const { poolPromise } = require("../config/db.js");

exports.obtenerClientes = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        id_cliente AS id,
        nombre,
        apellido,
        dni,
        cuit,
        empresa,
        direccion,
        codigo_postal,
        telefono,
        email
      FROM CLIENTES
      ORDER BY nombre;
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error obteniendo clientes:", err);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
};
