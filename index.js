require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const { authMiddleware } = require("./middleware/authMiddleware.js");

const { authRoutes } = require("./routes/authRoutes");
const { presupuestossRoutes } = require("./routes/presupuestosRoutes");
const { stockRoutes } = require("./routes/stockRoutes");
const { clientessRoutes } = require("./routes/clientesRoutes");

const clientesRoutes = require("./routes/clientes.js");
const productosRoutes = require("./routes/productos.js");
const presupuestosRoutes = require("./routes/presupuestos.js");

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");

/* ================================
   MIDDLEWARES BASE
================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================================
   FRONTEND ESTÁTICO
================================ */
app.use(express.static(FRONTEND_DIST));

/* ================================
   RUTAS PÚBLICAS
================================ */
app.use("/", authRoutes);

/* ================================
   AUTH GLOBAL
================================ */
app.use(authMiddleware);

/* ================================
   RUTAS PROTEGIDAS
================================ */
app.use("/", presupuestossRoutes);
app.use("/", stockRoutes);
app.use("/", clientessRoutes);

app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/presupuestos", presupuestosRoutes);

/* ================================
   SPA FALLBACK (SIEMPRE AL FINAL)
================================ */
app.get(/^\/(?!assets|auth).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.listen(PORT, () => console.log(`🔥 Servidor corriendo en puerto ${PORT}`));
