// utils/pdfGenerator.js
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

// Convierte imagen a base64
function toBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString("base64");
}

module.exports = async function generarPDF(data) {
  try {
    // 1) Cargar plantilla HBS
    const templatePath = path.join(__dirname, "../templates/presupuesto.hbs");
    const html = fs.readFileSync(templatePath, "utf8");

    // 2) Compilar con Handlebars
    const template = Handlebars.compile(html);

    // 3) Insertar logo en base64
    const logoBase64 = toBase64(path.join(__dirname, "../assets/logo.png"));

    const htmlFinal = template({
      ...data,
      logoBase64,
    });

    // 4) Puppeteer configurado para Render
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlFinal, { waitUntil: "networkidle0" });

    // 5) Generar PDF en buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" }, // Márgenes a cero
    });

    await browser.close();
    return pdfBuffer;
  } catch (err) {
    console.error("❌ Error generando PDF:", err);
    throw err;
  }
};
