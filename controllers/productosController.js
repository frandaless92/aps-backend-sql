const { poolPromise } = require("../config/db.js");

exports.obtenerTodosLosProductos = async (req, res) => {
  try {
    const pool = await poolPromise;

    // ACCESORIOS
    const accesorios = await pool.request().query(`
      SELECT
        id_producto AS id,
        descripcion AS nombre,
        stock,
        precio,
        precio_lista,
        'Accesorios' AS categoria
      FROM ACCESORIOS
    `);

    // TEJIDOS
    const tejidos = await pool.request().query(`
      SELECT
        id_producto AS id,
        descripcion + ' ' + cal + ' ' + pul + ' ' + alt + ' ' + long AS nombre,
        stock,
        precio,
        precio_lista,
        'Tejidos' AS categoria
      FROM TEJIDOS
    `);

    // Unimos resultados
    const productos = [...accesorios.recordset, ...tejidos.recordset];

    // Ordenar por categoría y luego por nombre
    productos.sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.nombre.localeCompare(b.nombre);
    });

    res.json(productos);
  } catch (err) {
    console.error("❌ Error obteniendo productos:", err);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};
