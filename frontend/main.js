import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
});

import "./src/style.css";

import { renderLogin } from "./src/pages/login.page";
import { renderHome } from "./src/pages/home.page";
import { renderLayout } from "./src/layout/renderLayout.js";
import { renderGenerateBudget } from "./src/pages/presupuestos/generateBudget.page";
import { renderManageBudgets } from "./src/pages/presupuestos/manageBudgets.page";
import { renderManageStock } from "./src/pages/stock/manageStock.page";
import { renderManageClients } from "./src/pages/clientes/manageClients.page";
import Swal from "sweetalert2";

window.Swal = Swal;

const app = document.getElementById("app");

if (!app) {
  throw new Error("❌ Contenedor #app no encontrado en index.html");
}

/* ================================
   ROUTER SIMPLE POR URL
================================ */
function router() {
  const path = window.location.pathname;

  app.innerHTML = "";

  if (path === "/home") {
    renderLayout(app, renderHome);
  } else if (path === "/presupuestos/generate-budget") {
    renderLayout(app, renderGenerateBudget);
  } else if (path === "/presupuestos/manage-budgets") {
    renderLayout(app, renderManageBudgets);
  } else if (path === "/stock/manage-stock") {
    renderLayout(app, renderManageStock);
  } else if (path === "/clientes/manage-clients") {
    renderLayout(app, renderManageClients);
  } else {
    renderLogin(app);
  }
}

window.addEventListener("DOMContentLoaded", router);
