const express = require("express");
const router = express.Router();

const {
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  actualizarStock,
} = require("../controllers/productosController.js");

router.get("/", obtenerTodosLosProductos);

// CRUD
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

// stock puntual
router.post("/update-stock", actualizarStock);

module.exports = router;
