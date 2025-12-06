const { poolPromise } = require("../config/db.js");
const PDFDocument = require("pdfkit");

exports.generarPresupuesto = async (req, res) => {
  try {
    const { cliente, items, total } = req.body;

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

    // 3) Crear PDF
    const doc = new PDFDocument();
    let chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdf);
    });

    // PDF contenido
    doc.fontSize(18).text(`Presupuesto N° ${nuevoNum}`);
    doc.moveDown();
    doc.fontSize(14).text(`Cliente: ${cliente.nombre}`);
    doc.text(`Total: $${total}`);
    doc.moveDown();

    items.forEach((i) => {
      doc.text(`${i.nombre} x${i.cantidad} - $${i.subtotal}`);
    });

    doc.end();
  } catch (err) {
    console.error("❌ Error generando presupuesto:", err);
    res.status(500).json({ error: "Error generando presupuesto" });
  }
};
