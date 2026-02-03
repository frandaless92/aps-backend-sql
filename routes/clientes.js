const express = require("express");
const router = express.Router();

const {
  obtenerClientes,
  crearCliente,
  eliminarCliente,
  actualizarCliente,
} = require("../controllers/clientesController.js");

router.get("/", obtenerClientes);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

module.exports = router;
