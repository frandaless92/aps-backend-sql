// controllers/generarPresupuesto.js
const { poolPromise } = require("../config/db.js");
const generarPDF = require("../utils/pdfGenerator");

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
        precio_unitario: i.precio,
        precio_total: i.subtotal,
      })),
      total,
      trabajo: trabajo || "No indicado",
      vendedor: vendedor || "No indicado",
      validez: validez || "30 días",
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
