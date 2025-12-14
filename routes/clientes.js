const express = require("express");
const router = express.Router();

const {
  obtenerClientes,
  crearCliente,
} = require("../controllers/clientesController.js");

router.get("/", obtenerClientes);
router.post("/", crearCliente);

module.exports = router;
