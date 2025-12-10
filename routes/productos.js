const express = require("express");
const router = express.Router();

const {
  obtenerTodosLosProductos,
  actualizarStock,
} = require("../controllers/productosController.js");

router.get("/", obtenerTodosLosProductos);
router.post("/update-stock", actualizarStock);

module.exports = router;
