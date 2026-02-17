// routes/presupuestos.js
const express = require("express");
const router = express.Router();
const {
  generarPresupuesto,
  gestionarPresupuestos,
  descargarPresupuesto,
  cambiarEstado,
  eliminarPresupuesto,
  borrarRechazados,
} = require("../controllers/generarPresupuesto");
const {
  expandirMaps,
  geocodingDireccion,
} = require("../controllers/mapsController");

router.post("/", generarPresupuesto);
router.delete("/borrar-rechazados", borrarRechazados);
router.delete("/:presupuesto", eliminarPresupuesto);
router.get("/gestion", gestionarPresupuestos);
router.get("/gestion/descargar-pdf/:presupuesto", descargarPresupuesto);
router.post("/gestion/cambiar-estado", cambiarEstado);
router.post("/expandir-maps", expandirMaps);
router.post("/geocoding", geocodingDireccion);

module.exports = router;
