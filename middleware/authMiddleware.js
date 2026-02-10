const crypto = require("crypto");
/* ================================
   GENERAR TOKEN VÁLIDO
================================ */
function generarToken(username) {
  return crypto
    .createHmac("sha256", process.env.APP_TOKEN_SECRET)
    .update(username)
    .digest("hex");
}

/* ================================
   AUTH MIDDLEWARE
================================ */
function authMiddleware(req, res, next) {
  const key = req.headers["x-api-key"];
  const token =
    req.cookies?.auth_token || req.headers.authorization?.split(" ")[1];

  if (!token && !key) {
    return handleUnauthorized(req, res, "Token o API Key requerido");
  }

  const tokenValido = generarToken(process.env.APP_USER);

  if (token !== tokenValido && key !== process.env.APS_API_KEY) {
    return handleUnauthorized(req, res, "Token o API Key inválidos");
  }

  next();
}

/* ================================
   RESPUESTA SEGÚN TIPO DE REQUEST
================================ */
function handleUnauthorized(req, res, message) {
  const acceptsHTML = req.accepts("html");
  const isAPI = req.originalUrl.startsWith("/api");

  // 🔌 APIs → JSON
  if (isAPI || !acceptsHTML) {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  // 🧾 Vistas → redirect
  return res.redirect("/");
}

module.exports = { authMiddleware, generarToken };
