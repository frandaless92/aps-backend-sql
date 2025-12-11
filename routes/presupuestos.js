// routes/presupuestos.js
const express = require("express");
const router = express.Router();
const {
  generarPresupuesto,
  gestionarPresupuestos,
} = require("../controllers/generarPresupuesto");

router.post("/", generarPresupuesto);
router.get("/gestion", gestionarPresupuestos);

module.exports = router;
