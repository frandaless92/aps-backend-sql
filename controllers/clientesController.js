const { poolPromise } = require("../config/db.js");

exports.obtenerClientes = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        id_cliente AS id,
        nombre,
        apellido,
        dni,
        cuit,
        empresa,
        direccion,
        codigo_postal,
        telefono,
        email
      FROM CLIENTES
      ORDER BY TRY_CONVERT(INT, apellido);
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error obteniendo clientes:", err);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
};

exports.crearCliente = async (req, res) => {
  try {
    const {
      apellido,
      nombre,
      dni,
      cuit,
      empresa,
      direccion,
      codigo_postal,
      telefono,
      email,
    } = req.body;

    // Validación mínima
    if (!apellido || !telefono) {
      return res.status(400).json({
        error: "Apellido y teléfono son obligatorios",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("apellido", apellido)
      .input("nombre", nombre)
      .input("dni", dni || null)
      .input("cuit", cuit || null)
      .input("empresa", empresa || null)
      .input("direccion", direccion || null)
      .input("codigo_postal", codigo_postal || null)
      .input("telefono", telefono || null)
      .input("email", email || null).query(`
        INSERT INTO CLIENTES (
          apellido,
          nombre,
          dni,
          cuit,
          empresa,
          direccion,
          codigo_postal,
          telefono,
          email
        )
        OUTPUT INSERTED.id_cliente AS id
        VALUES (
          @apellido,
          @nombre,
          @dni,
          @cuit,
          @empresa,
          @direccion,
          @codigo_postal,
          @telefono,
          @email
        );
      `);

    // Devolvemos el cliente creado (mínimo indispensable)
    res.status(201).json({
      id: result.recordset[0].id,
      apellido,
      nombre,
      dni,
      cuit,
      empresa,
      direccion,
      codigo_postal,
      telefono,
      email,
    });
  } catch (err) {
    console.error("❌ Error creando cliente:", err);
    res.status(500).json({ error: "Error creando cliente" });
  }
};
