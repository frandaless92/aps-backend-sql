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
      ORDER BY
        CASE 
          WHEN TRY_CONVERT(INT, apellido) IS NOT NULL
            THEN TRY_CONVERT(INT, apellido)
          ELSE -1
        END DESC,
        apellido DESC;
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

exports.actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;

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

    if (!id) {
      return res.status(400).json({ error: "ID de cliente requerido" });
    }

    // Validación mínima
    if (!apellido || !telefono) {
      return res.status(400).json({
        error: "Apellido y teléfono son obligatorios",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("id", id)
      .input("apellido", apellido)
      .input("nombre", nombre)
      .input("dni", dni || null)
      .input("cuit", cuit || null)
      .input("empresa", empresa || null)
      .input("direccion", direccion || null)
      .input("codigo_postal", codigo_postal || null)
      .input("telefono", telefono)
      .input("email", email || null).query(`
        UPDATE CLIENTES
        SET
          apellido = @apellido,
          nombre = @nombre,
          dni = @dni,
          cuit = @cuit,
          empresa = @empresa,
          direccion = @direccion,
          codigo_postal = @codigo_postal,
          telefono = @telefono,
          email = @email
        WHERE id_cliente = @id;

        SELECT
          id_cliente AS id,
          apellido,
          nombre,
          dni,
          cuit,
          empresa,
          direccion,
          codigo_postal,
          telefono,
          email
        FROM CLIENTES
        WHERE id_cliente = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error actualizando cliente:", err);
    res.status(500).json({ error: "Error actualizando cliente" });
  }
};

exports.eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de cliente requerido" });
    }

    const pool = await poolPromise;

    const result = await pool.request().input("id", id).query(`
        DELETE FROM CLIENTES
        WHERE id_cliente = @id;
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error eliminando cliente:", err);
    res.status(500).json({ error: "Error eliminando cliente" });
  }
};
