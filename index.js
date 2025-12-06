const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clientesRoutes = require("./routes/clientes.js");
const productosRoutes = require("./routes/productos.js");
const presupuestosRoutes = require("./routes/presupuestos.js");

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/clientes", clientesRoutes);
app.use("/productos", productosRoutes);
app.use("/presupuestos", presupuestosRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`🔥 Servidor corriendo en puerto ${PORT}`));
