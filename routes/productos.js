const express = require("express");
const router = express.Router();

const {
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
  exportarProductosExcel,
  actualizarPreciosMasivo,
} = require("../controllers/productosController.js");

router.get("/", obtenerTodosLosProductos);

// CRUD
router.post("/", crearProducto);

router.put("/actualizar-precios", actualizarPreciosMasivo);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);
router.get("/excel", exportarProductosExcel);

// stock puntual
router.post("/update-stock", actualizarStock);

module.exports = router;
