// services/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function enviarPresupuestoEmailEntregado({
  presupuesto,
  cliente,
  total,
  productos,
  metodoPago,
  tipoEntrega,
  fechaEntrega,
  horaEntrega,
  direccion,
  linkMaps,
  datosAdicionales,
  pdfBuffer,
}) {
  const productosHtml = productos
    .map(
      (p) => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>$${p.precio}</td>
        <td>$${p.subtotal}</td>
      </tr>
    `,
    )
    .join("");

  const html = `
    <h2>Presupuesto ${presupuesto} ENTREGADO</h2>
    <p><strong>Cliente:</strong> ${cliente?.apellido || ""} ${
      cliente?.nombre || ""
    }</p>
    <p><strong>Método de pago:</strong> ${metodoPago || "-"}</p>
    <p><strong>Tipo de entrega:</strong> ${tipoEntrega || "-"}</p>
    <p><strong>Fecha entrega:</strong> ${fechaEntrega || "-"}</p>
    <p><strong>Hora entrega:</strong> ${horaEntrega || "-"}</p>
    <p><strong>Dirección:</strong> ${direccion || "-"}</p>
    <p><strong>Link Maps:</strong> ${linkMaps || "-"}</p>
    <p><strong>Datos adicionales:</strong> ${datosAdicionales || "-"}</p>

    <h3>Productos</h3>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${productosHtml}
      </tbody>
    </table>

    <h2>Total: $${total}</h2>
  `;

  await transporter.sendMail({
    from: `"APS Sistema" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: `Presupuesto ${presupuesto} ENTREGADO`,
    html,
    attachments: pdfBuffer
      ? [
          {
            filename: `Presupuesto_${presupuesto}.pdf`,
            content: pdfBuffer,
          },
        ]
      : [],
  });
}

async function enviarPresupuestoEmailAconfirmar({
  presupuesto,
  cliente,
  total,
  productos,
  pdfBuffer,
}) {
  const productosHtml = productos
    .map(
      (p) => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.cantidad}</td>
        <td>$${p.precio}</td>
        <td>$${p.subtotal}</td>
      </tr>
    `,
    )
    .join("");

  const html = `
    <h2>Presupuesto ${presupuesto} - A CONFIRMAR</h2>
    <p><strong>Cliente:</strong> ${cliente?.apellido || ""} ${
      cliente?.nombre || ""
    }</p>
    
    <h3>Productos</h3>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${productosHtml}
      </tbody>
    </table>

    <h2>Total: $${total}</h2>
  `;

  await transporter.sendMail({
    from: `"APS Sistema" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: `Presupuesto ${presupuesto} - A CONFIRMAR`,
    html,
    attachments: pdfBuffer
      ? [
          {
            filename: `Presupuesto_${presupuesto}.pdf`,
            content: pdfBuffer,
          },
        ]
      : [],
  });
}

module.exports = {
  enviarPresupuestoEmailEntregado,
  enviarPresupuestoEmailAconfirmar,
};
