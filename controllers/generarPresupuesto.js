// controllers/generarPresupuesto.js
const { poolPromise } = require("../config/db.js");
const generarPDF = require("../utils/pdfGenerator");

exports.gestionarPresupuestos = async (req, res) => {
  try {
    const pool = await poolPromise;

    // 1) TRAER TODOS LOS PRESUPUESTOS
    const presupuestosRes = await pool.request().query(`
      SELECT PRESUPUESTO, ESTADO
      FROM ARCHIVOPRESUPUESTO
      ORDER BY PRESUPUESTO ASC
    `);

    const presupuestos = presupuestosRes.recordset;

    const resultadoFinal = [];

    // 2) RECORRER CADA PRESUPUESTO
    for (const p of presupuestos) {
      // 2.1) BUSCAR PRODUCTOS ASOCIADOS
      const productosRes = await pool.request().input("pres", p.PRESUPUESTO)
        .query(`
          SELECT TIPO, ID_PRODUCTO, CANTIDAD
          FROM CONTROLSTOCK
          WHERE PRESUPUESTO = @pres
        `);

      const productos = [];

      // 3) ARMAR ARRAY DE PRODUCTOS PARA ESTE PRESUPUESTO
      for (const prod of productosRes.recordset) {
        let descripcion = "";

        if (prod.TIPO === "ACCESORIOS") {
          const acc = await pool.request().input("id", prod.ID_PRODUCTO).query(`
              SELECT descripcion AS descripcion
              FROM ACCESORIOS
              WHERE id_producto = @id
            `);

          descripcion = acc.recordset[0]?.descripcion || "Sin descripción";
        }

        if (prod.TIPO === "TEJIDOS") {
          const tej = await pool.request().input("id", prod.ID_PRODUCTO).query(`
              SELECT descripcion + ' ' + cal + ' ' + pul + ' ' + alt + ' ' + long AS descripcion
              FROM TEJIDOS
              WHERE id_producto = @id
            `);

          descripcion = tej.recordset[0]?.descripcion || "Sin descripción";
        }

        productos.push({
          id: prod.ID_PRODUCTO,
          descripcion,
          cantidad: prod.CANTIDAD,
          tipo: prod.TIPO,
        });
      }

      // 4) PUSH DEL OBJETO COMPLETO
      resultadoFinal.push({
        PRESUPUESTO: p.PRESUPUESTO,
        ESTADO: p.ESTADO,
        PRODUCTOS: productos,
      });
    }

    res.json(resultadoFinal);
  } catch (err) {
    console.error("Error en /presupuestos/gestion:", err);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
};

exports.generarPresupuesto = async (req, res) => {
  try {
    const { cliente, items, total, vendedor, trabajo, condicionPago, validez } =
      req.body;

    const pool = await poolPromise;

    // 1) Obtener último número de presupuesto
    const queryVar = await pool.request().query(`
      SELECT PRESUPUESTO FROM VARIABLES
    `);

    const nuevoNum = queryVar.recordset[0].PRESUPUESTO + 1;

    // 2) Guardar nuevo número
    await pool.request().query(`
      UPDATE VARIABLES SET PRESUPUESTO = ${nuevoNum}
    `);

    const presupuestoNumero = nuevoNum;

    function formatoPrecio(num) {
      return num
        .toFixed(2) // fuerza 2 decimales
        .replace(".", ",") // cambia decimal por coma
        .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // agrega puntos de miles
    }

    function fechaArgentina() {
      const offset = -3; // Argentina UTC-3
      const now = new Date();
      const local = new Date(now.getTime() + offset * 60 * 60 * 1000);

      const d = String(local.getUTCDate()).padStart(2, "0");
      const m = String(local.getUTCMonth() + 1).padStart(2, "0");
      const y = local.getUTCFullYear();

      return `${d}/${m}/${y}`;
    }

    const fecha = fechaArgentina();

    const data = {
      cliente,
      items: items.map((i) => ({
        cantidad: i.cantidad,
        descripcion: i.nombre || i.descripcion,
        precio_unitario: formatoPrecio(i.precio),
        precio_total: formatoPrecio(i.subtotal),
      })),
      total: formatoPrecio(total),
      trabajo: trabajo || "No indicado",
      vendedor: vendedor || "No indicado",
      validez: validez || "A determinar",
      condicionPago: condicionPago || "Contado",
      presupuestoNumero,
      fecha,
    };

    const pdf = await generarPDF(data);

    // 🔥 HEADERS CORRECTOS
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=presupuesto_${presupuestoNumero}.pdf`
    );

    // ❗ ESTA ES LA LÍNEA QUE SOLUCIONA EL PDF DAÑADO
    return res.end(pdf);
  } catch (error) {
    console.error("❌ Error al generar presupuesto:", error);
    return res.status(500).json({ error: "Error generando el presupuesto" });
  }
};
