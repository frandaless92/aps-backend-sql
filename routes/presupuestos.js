// routes/presupuestos.js
const express = require("express");
const router = express.Router();
const {
  generarPresupuesto,
  gestionarPresupuestos,
  descargarPresupuesto,
} = require("../controllers/generarPresupuesto");

router.post("/", generarPresupuesto);
router.get("/gestion", gestionarPresupuestos);
router.get("/gestion/descargar-pdf/:presupuesto", descargarPresupuesto);

module.exports = router;
