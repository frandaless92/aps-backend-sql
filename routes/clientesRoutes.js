const { Router } = require("express");
const clientessRoutes = Router();
const path = require("path");

const FRONTEND_DIST = path.join(__dirname, "./../frontend/dist");

clientessRoutes.get(/^\/clientes\/.*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

module.exports = { clientessRoutes };
