// controllers/generarPresupuesto.js
const { poolPromise } = require("../config/db.js");
const generarPDF = require("../utils/pdfGenerator");

exports.generarPresupuesto = async (req, res) => {
  try {
    const { cliente, items, total, vendedor, condicionPago } = req.body;

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
    const fecha = new Date().toLocaleDateString("es-AR");
    const validez = "30 días";

    const data = {
      cliente,
      items: items.map((i) => ({
        cantidad: i.cantidad,
        descripcion: i.nombre || i.descripcion,
        precio_unitario: i.precio,
        precio_total: i.subtotal,
      })),
      total,
      vendedor: vendedor || "No indicado",
      condicionPago: condicionPago || "Contado",
      presupuestoNumero,
      fecha,
      validez,
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
