const express = require("express");
const router = express.Router();

const {
  obtenerTodosLosProductos,
} = require("../controllers/productosController.js");

router.get("/", obtenerTodosLosProductos);

module.exports = router;
