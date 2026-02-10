const { Router } = require("express");
const presupuestossRoutes = Router();
const path = require("path");

const FRONTEND_DIST = path.join(__dirname, "./../frontend/dist");

presupuestossRoutes.get(/^\/presupuestos\/.*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

module.exports = { presupuestossRoutes };
