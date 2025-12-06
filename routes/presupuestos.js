const express = require("express");
const router = express.Router();

const {
  generarPresupuesto,
} = require("../controllers/presupuestosController.js");

router.post("/", generarPresupuesto);

module.exports = router;
