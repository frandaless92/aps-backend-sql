const { poolPromise } = require("../config/db.js");
const ExcelJS = require("exceljs");

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
        descripcion,
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
      precio: p.precio,
      precio_lista: p.precio_lista,
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

exports.crearProducto = async (req, res) => {
  try {
    const {
      tipo,
      descripcion,
      stock,
      precio,
      precio_lista,
      calibre,
      pulgada,
      altura,
      longitud,
    } = req.body;
    const pool = await poolPromise;

    if (tipo === "ACCESORIOS") {
      await pool
        .request()
        .input("descripcion", descripcion)
        .input("stock", stock)
        .input("precio", precio)
        .input("precio_lista", precio_lista).query(`
          INSERT INTO ACCESORIOS (descripcion, stock, precio, precio_lista)
          VALUES (@descripcion, @stock, @precio, @precio_lista)
        `);
    }

    if (tipo === "TEJIDOS") {
      await pool
        .request()
        .input("descripcion", descripcion)
        .input("cal", calibre)
        .input("pul", pulgada)
        .input("alt", altura)
        .input("long", longitud)
        .input("stock", stock)
        .input("precio", precio)
        .input("precio_lista", precio_lista).query(`
          INSERT INTO TEJIDOS (descripcion, cal, pul, alt, long, stock, precio, precio_lista)
          VALUES (@descripcion, @cal, @pul, @alt, @long, @stock, @precio, @precio_lista)
        `);
    }

    res.json({ message: "Producto creado correctamente" });
  } catch (err) {
    console.error("❌ Crear producto:", err);
    res.status(500).json({ error: "Error creando producto" });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo,
      descripcion,
      stock,
      precio,
      precio_lista,
      calibre,
      pulgada,
      altura,
      longitud,
    } = req.body;
    const pool = await poolPromise;

    if (tipo === "ACCESORIOS") {
      await pool
        .request()
        .input("id", id)
        .input("descripcion", descripcion)
        .input("stock", stock)
        .input("precio", precio)
        .input("precio_lista", precio_lista).query(`
          UPDATE ACCESORIOS
          SET descripcion=@descripcion, stock=@stock, precio=@precio, precio_lista=@precio_lista
          WHERE id_producto=@id
        `);
    }

    if (tipo === "TEJIDOS") {
      await pool
        .request()
        .input("id", id)
        .input("descripcion", descripcion)
        .input("cal", calibre)
        .input("pul", pulgada)
        .input("alt", altura)
        .input("long", longitud)
        .input("stock", stock)
        .input("precio", precio)
        .input("precio_lista", precio_lista).query(`
          UPDATE TEJIDOS
          SET descripcion=@descripcion, cal=@cal, pul=@pul, alt=@alt, long=@long,
              stock=@stock, precio=@precio, precio_lista=@precio_lista
          WHERE id_producto=@id
        `);
    }

    res.json({ message: "Producto actualizado" });
  } catch (err) {
    console.error("❌ Actualizar producto:", err);
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;
    const pool = await poolPromise;

    const tabla = tipo === "TEJIDOS" ? "TEJIDOS" : "ACCESORIOS";

    const r = await pool
      .request()
      .input("id", id)
      .query(`DELETE FROM ${tabla} WHERE id_producto=@id`);

    if (r.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error("❌ Eliminar producto:", err);
    res.status(500).json({ error: "Error eliminando producto" });
  }
};

exports.exportarProductosExcel = async (req, res) => {
  try {
    const pool = await poolPromise;

    // ============================
    // ACCESORIOS
    // ============================
    const accesorios = await pool.request().query(`
      SELECT
        id_producto AS id,
        descripcion AS nombre,
        stock,
        precio,
        precio_lista
      FROM ACCESORIOS
      ORDER BY descripcion
    `);

    // ============================
    // TEJIDOS
    // ============================
    const tejidos = await pool.request().query(`
      SELECT
        id_producto AS id,
        descripcion,
        cal,
        pul,
        alt,
        long,
        stock,
        precio,
        precio_lista
      FROM TEJIDOS
      ORDER BY descripcion
    `);

    // ============================
    // EXCEL
    // ============================
    const workbook = new ExcelJS.Workbook();

    // ---------- HOJA ACCESORIOS ----------
    const sheetAcc = workbook.addWorksheet("Accesorios");

    sheetAcc.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Descripción", key: "nombre", width: 40 },
      { header: "Stock", key: "stock", width: 12 },
      { header: "Precio Contado", key: "precio", width: 15 },
      { header: "Precio Lista", key: "precio_lista", width: 15 },
    ];

    accesorios.recordset.forEach((p) => {
      sheetAcc.addRow({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        precio: Number(p.precio),
        precio_lista: Number(p.precio_lista),
      });
    });

    sheetAcc.getRow(1).font = { bold: true };

    // ---------- HOJA TEJIDOS ----------
    const sheetTej = workbook.addWorksheet("Tejidos");

    sheetTej.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Descripción", key: "descripcion", width: 30 },
      { header: "Calibre", key: "cal", width: 10 },
      { header: "Pulgada", key: "pul", width: 10 },
      { header: "Altura", key: "alt", width: 10 },
      { header: "Longitud", key: "long", width: 10 },
      { header: "Stock", key: "stock", width: 12 },
      { header: "Precio Contado", key: "precio", width: 15 },
      { header: "Precio Lista", key: "precio_lista", width: 15 },
    ];

    tejidos.recordset.forEach((p) => {
      sheetTej.addRow({
        id: p.id,
        descripcion: p.descripcion,
        cal: p.cal,
        pul: p.pul,
        alt: p.alt,
        long: p.long,
        stock: p.stock,
        precio: Number(p.precio),
        precio_lista: Number(p.precio_lista),
      });
    });

    sheetTej.getRow(1).font = { bold: true };

    // ============================
    // RESPUESTA
    // ============================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="productos.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Exportar Excel productos:", err);
    res.status(500).json({ error: "Error generando Excel de productos" });
  }
};

exports.actualizarPreciosMasivo = async (req, res) => {
  try {
    const { porcentaje } = req.body;

    if (porcentaje === undefined || isNaN(Number(porcentaje))) {
      return res.status(400).json({ error: "Porcentaje inválido" });
    }

    const pool = await poolPromise;
    const p = Number(porcentaje);

    // =============================
    // ACCESORIOS
    // =============================
    await pool.request().input("porcentaje", p).query(`
        UPDATE ACCESORIOS
        SET precio_lista = CEILING(precio * (1 + (@porcentaje / 100.0)))
      `);

    // =============================
    // TEJIDOS
    // =============================
    await pool.request().input("porcentaje", p).query(`
        UPDATE TEJIDOS
        SET precio_lista = CEILING(precio * (1 + (@porcentaje / 100.0)))
      `);

    res.json({
      message: "Precios actualizados correctamente",
      porcentaje: p,
    });
  } catch (err) {
    console.error("❌ Error actualizando precios:", err);
    res.status(500).json({ error: "Error actualizando precios masivamente" });
  }
};
