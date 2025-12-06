const express = require("express");
const router = express.Router();

const {
  obtenerAccesorios,
  obtenerTejidos,
} = require("../controllers/productosController.js");

router.get("/accesorios", obtenerAccesorios);
router.get("/tejidos", obtenerTejidos);

module.exports = router;
