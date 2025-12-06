import PDFDocument from "pdfkit";
import getStream from "get-stream";

export default async function generarPDF({
  numero,
  cliente,
  items,
  total,
  fecha,
}) {
  const doc = new PDFDocument();
  const stream = doc.pipe(getStream.buffer());

  doc.fontSize(18).text(`Presupuesto #${numero}`);
  doc.text(`Fecha: ${fecha.toLocaleDateString()}`);
  doc.moveDown();
  doc.fontSize(14).text(`Cliente: ${cliente.nombre} ${cliente.apellido}`);
  doc.moveDown();

  items.forEach((i) => {
    doc
      .fontSize(12)
      .text(
        `${i.nombre} - Cant: ${i.cantidad} - $${i.precio} - Subtotal: $${i.subtotal}`
      );
  });

  doc.moveDown();
  doc.fontSize(16).text(`Total: $${total}`);

  doc.end();

  return stream;
}
