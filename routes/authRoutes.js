const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { generarToken } = require("../middleware/authMiddleware.js");

const authRoutes = Router();

/* ================================
   LOGIN
================================ */

authRoutes.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Datos incompletos",
    });
  }

  if (username !== process.env.APP_USER) {
    return res.status(401).json({
      success: false,
      message: "Credenciales inválidas",
    });
  }

  const valid = await bcrypt.compare(password, process.env.APP_PASS_HASH);

  if (!valid) {
    return res.status(401).json({
      success: false,
      message: "Credenciales inválidas",
    });
  }

  const token = generarToken(username);
  return res
    .cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true si usás https
    })
    .json({
      success: true,
      message: "Login OK",
    });
});

authRoutes.post("/auth/logout", (req, res) => {
  res.clearCookie("auth_token").json({
    success: true,
    message: "Logout OK",
  });
});

module.exports = { authRoutes };
