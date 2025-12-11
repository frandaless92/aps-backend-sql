// routes/presupuestos.js
const express = require("express");
const router = express.Router();
const {
  generarPresupuesto,
  gestionarPresupuestos,
  descargarPresupuesto,
  cambiarEstado,
  eliminarPresupuesto,
} = require("../controllers/generarPresupuesto");

router.post("/", generarPresupuesto);
router.delete("/:presupuesto", eliminarPresupuesto);
router.get("/gestion", gestionarPresupuestos);
router.get("/gestion/descargar-pdf/:presupuesto", descargarPresupuesto);
router.post("/gestion/cambiar-estado", cambiarEstado);

module.exports = router;
