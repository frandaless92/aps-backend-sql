const express = require("express");
const router = express.Router();

const { obtenerClientes } = require("../controllers/clientesController.js");

router.get("/", obtenerClientes);

module.exports = router;
