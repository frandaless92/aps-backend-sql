const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

module.exports = async function generarPDF(data) {
  const templatePath = path.join(__dirname, "../templates/presupuesto.hbs");
  const handlebars = require("handlebars");

  const html = fs.readFileSync(templatePath, "utf8");

  const template = handlebars.compile(html);

  // Render HTML con datos
  const content = template(data);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(content, {
    waitUntil: "networkidle0",
  });

  // HEADER – se repite en TODAS las páginas
  const headerHTML = `
    <div style="
      width: 100%;
      padding: 10px 20px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <img src="data:image/png;base64,${data.logoBase64}" style="height:40px;" />
      <div style="width: 60px;
      height: 60px; border: 2px solid #000; display: flex; justify-content:
      center; align-items: center; font-size: 26px; font-weight: bold; margin: 0
      20px; user-select: none;">
          X
        </div>
      <div style="text-align:right; font-size:12px;">
        <strong>PRESUPUESTO Nº ${data.presupuestoNumero}</strong><br/>
        Fecha: ${data.fecha}<br/>
        Válido hasta: ${data.validez}
      </div>
    </div>
  `;

  // FOOTER – se repite en TODAS las páginas
  const footerHTML = `
    <div style="
      width:100%;
      text-align:center;
      font-size:11px;
      padding:10px;
      color:#444;
    ">
    <p>Este es un presupuesto de los artículos indicados, sujeto a las
          condiciones que se indican a continuación:</p>
        * Valores expresados en pesos argentinos (ARS).<br />
        * Tiene validez hasta la fecha indicada en el encabezado.<br />
        * Una vez aceptado el mismo, puede tener una demora de hasta CINCO (5)
        días para su entrega.
        <br />
        * No incluye traslado ni instalación, salvo que se indique lo contrario.
      <div style="margin-bottom:4px;">
        ¡MUCHAS GRACIAS POR SU CONFIANZA!
      </div>
      Página <span class="pageNumber"></span> de <span class="totalPages"></span>
    </div>
  `;

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerHTML,
    footerTemplate: footerHTML,
    margin: {
      top: "120px", // espacio para el header
      bottom: "100px", // espacio para el footer
    },
  });

  await browser.close();
  return pdf;
};
