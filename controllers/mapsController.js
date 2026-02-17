const axios = require("axios");

exports.expandirMaps = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.json({ ok: false });

    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const finalUrl =
      response.request?.res?.responseUrl || response.config?.url || url;
    // 1️⃣ Formato @lat,lng
    let match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (match) {
      return res.json({
        ok: true,
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      });
    }

    // 2️⃣ Formato /search/lat,+lng
    match = finalUrl.match(/search\/(-?\d+\.\d+),\+?(-?\d+\.\d+)/);

    if (match) {
      return res.json({
        ok: true,
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      });
    }

    return res.json({ ok: false });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
};

exports.geocodingDireccion = async (req, res) => {
  try {
    const { direccion } = req.body;

    if (!direccion) return res.json({ ok: false });

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: direccion,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "APS-App",
        },
      },
    );

    if (!response.data.length) return res.json({ ok: false });

    res.json({
      ok: true,
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon),
    });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
};
