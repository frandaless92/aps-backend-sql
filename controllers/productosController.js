const { poolPromise } = require("../config/db.js");

function parsePrecio(valor) {
  if (valor == null) return 0;

  let limpio = valor.toString().trim();
  limpio = limpio.replace(/\./g, ""); // elimina miles
  limpio = limpio.replace(/,/g, "."); // coma → punto

  const n = parseFloat(limpio);
  return isNaN(n) ? 0 : n;
}

exports.actualizarStock = async (req, res) => {
  try {
    const { id, categoria, stock } = req.body;

    if (!id || !categoria || stock === undefined) {
      return res
        .status(400)
        .json({ error: "Faltan datos: id, categoria o stock" });
    }

    // Normalizar categoría
    const cat = categoria.toLowerCase();

    let tabla = null;

    if (cat === "accesorios") tabla = "ACCESORIOS";
    else if (cat === "tejidos") tabla = "TEJIDOS";
    else {
      return res.status(400).json({ error: "Categoría inválida" });
    }

    const pool = await poolPromise;

    // Query directo gracias a la categoría
    const result = await pool.request().input("stock", stock).input("id", id)
      .query(`
        UPDATE ${tabla}
        SET stock = @stock
        WHERE id_producto = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    return res.json({
      message: `Stock actualizado correctamente en ${tabla}`,
      id,
      stock,
    });
  } catch (err) {
    console.error("❌ Error actualizando stock:", err);
    return res.status(500).json({ error: "Error al actualizar stock" });
  }
};

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
        cal,
        pul,
        alt,
        long,
        stock,
        precio,
        precio_lista,
        'Tejidos' AS categoria
      FROM TEJIDOS
    `);

    // Unimos resultados
    let productos = [...accesorios.recordset, ...tejidos.recordset];

    // 🔥 Normalizar precios acá
    productos = productos.map((p) => ({
      ...p,
      precio: parsePrecio(p.precio),
      precio_lista: parsePrecio(p.precio_lista),
    }));

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
