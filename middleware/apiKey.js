require("dotenv").config();

module.exports = function (req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key) {
    return res.status(401).json({ error: "API Key faltante" });
  }

  if (key !== process.env.API_KEY) {
    return res.status(403).json({ error: "API Key inválida" });
  }

  next();
};
