// controllers/generarPresupuesto.js
const generarPDF = require("../utils/pdfGenerator");
const { poolPromise, sql } = require("../config/db");

exports.eliminarPresupuesto = async (req, res) => {
  const { presupuesto } = req.params;

  if (!presupuesto) {
    return res.status(400).json({
      error: "Debe enviar el número de presupuesto.",
    });
  }

  let transaction;

  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);

    await transaction.begin();

    // 1) BORRAR CONTROLSTOCK
    const req1 = new sql.Request(transaction);
    await req1.input("PRESUPUESTO", sql.NVarChar, presupuesto).query(`
        DELETE FROM CONTROLSTOCK
        WHERE PRESUPUESTO = @PRESUPUESTO
      `);

    // 2) BORRAR ARCHIVOPRESUPUESTO
    const req2 = new sql.Request(transaction);
    await req2.input("PRESUPUESTO", sql.NVarChar, presupuesto).query(`
        DELETE FROM ARCHIVOPRESUPUESTO
        WHERE PRESUPUESTO = @PRESUPUESTO
      `);

    await transaction.commit();

    return res.json({
      ok: true,
      msg: `Presupuesto ${presupuesto} eliminado correctamente.`,
    });
  } catch (err) {
    console.error("Error eliminando presupuesto:", err);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (e) {
        console.error("Error en rollback:", e);
      }
    }

    return res.status(500).json({
      error: "Error interno del servidor.",
    });
  }
};

exports.cambiarEstado = async (req, res) => {
  const { presupuesto, nuevoEstado, productos } = req.body;

  if (!presupuesto || !nuevoEstado) {
    return res.status(400).json({
      error: "Faltan datos: presupuesto o nuevoEstado.",
    });
  }

  let transaction;

  try {
    const pool = await poolPromise;

    // Crear transacción correctamente
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // 0. OBTENER ESTADO ACTUAL
    const reqEstado = new sql.Request(transaction);

    const estadoActualResult = await reqEstado.input(
      "PRESUPUESTO",
      sql.NVarChar,
      presupuesto
    ).query(`
    SELECT ESTADO
    FROM ARCHIVOPRESUPUESTO
    WHERE PRESUPUESTO = @PRESUPUESTO
  `);

    if (estadoActualResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        error: "Presupuesto no encontrado.",
      });
    }

    const estadoAnterior = estadoActualResult.recordset[0].ESTADO;

    // 1. ACTUALIZAR ESTADO DEL PRESUPUESTO
    const reqUpdate = new sql.Request(transaction);

    await reqUpdate
      .input("PRESUPUESTO", sql.NVarChar, presupuesto)
      .input("ESTADO", sql.NVarChar, nuevoEstado).query(`
    UPDATE ARCHIVOPRESUPUESTO
    SET ESTADO = @ESTADO
    WHERE PRESUPUESTO = @PRESUPUESTO
  `);

    // 2. SI ES CONFIRMADO -> DESCONTAR STOCK
    if (nuevoEstado === "PREPARAR") {
      if (!Array.isArray(productos)) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Debes enviar productos para confirmar el presupuesto.",
        });
      }

      for (const prod of productos) {
        // 🟢 Mano de obra no toca stock
        if (prod.tipo === "SERVICIO") continue;

        const tabla =
          prod.tipo === "ACCESORIOS"
            ? "ACCESORIOS"
            : prod.tipo === "TEJIDOS"
            ? "TEJIDOS"
            : null;

        if (!tabla) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Tipo de producto no válido: ${prod.tipo}`,
          });
        }

        const req2 = new sql.Request(transaction);
        await req2
          .input("ID_PRODUCTO", sql.NVarChar, prod.id)
          .input("CANTIDAD", sql.Int, prod.cantidad).query(`
            UPDATE ${tabla}
            SET stock = stock - @CANTIDAD
            WHERE id_producto = @ID_PRODUCTO
          `);
      }
    }

    // 2.b SI SE RECHAZA Y ANTES ESTABA EN PREPARAR -> DEVOLVER STOCK
    if (nuevoEstado === "RECHAZADO" && estadoAnterior === "PREPARAR") {
      if (!Array.isArray(productos)) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Debes enviar productos para revertir stock.",
        });
      }

      for (const prod of productos) {
        // 🟢 Mano de obra no toca stock
        if (prod.tipo === "SERVICIO") continue;

        const tabla =
          prod.tipo === "ACCESORIOS"
            ? "ACCESORIOS"
            : prod.tipo === "TEJIDOS"
            ? "TEJIDOS"
            : null;

        if (!tabla) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Tipo de producto no válido: ${prod.tipo}`,
          });
        }

        const req2 = new sql.Request(transaction);
        await req2
          .input("ID_PRODUCTO", sql.NVarChar, prod.id)
          .input("CANTIDAD", sql.Int, prod.cantidad).query(`
        UPDATE ${tabla}
        SET stock = stock + @CANTIDAD
        WHERE id_producto = @ID_PRODUCTO
      `);
      }
    }

    // 3. FINALIZAR TRANSACCIÓN
    await transaction.commit();

    return res.json({
      ok: true,
      msg: `Presupuesto ${presupuesto} actualizado a ${nuevoEstado}`,
    });
  } catch (err) {
    console.error("Error cambiando estado:", err);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error("Error realizando rollback:", rollbackErr);
      }
    }

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

exports.descargarPresupuesto = async (req, res) => {
  try {
    const presupuesto = req.params.presupuesto;

    const pool = await poolPromise;

    const result = await pool.request().input("pres", presupuesto).query(`
        SELECT ARCHIVO, NOMBRE_DE_ARCHIVO
        FROM ARCHIVOPRESUPUESTO
        WHERE PRESUPUESTO = @pres
      `);

    if (result.recordset.length === 0) {
      return res.status(404).send("No encontrado");
    }

    const archivo = result.recordset[0].ARCHIVO;
    const nombre =
      result.recordset[0].NOMBRE_DE_ARCHIVO || `${presupuesto}.pdf`;

    if (!archivo) {
      return res.status(404).send("Sin archivo PDF");
    }

    // HEADERS ESENCIALES
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "*");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${nombre}"`);
    res.setHeader("Content-Length", archivo.length);

    res.send(archivo);
  } catch (err) {
    console.error("Error en descargar PDF", err);
    res.status(500).send("Error interno");
  }
};

exports.gestionarPresupuestos = async (req, res) => {
  try {
    const pool = await poolPromise;

    // 1) TRAER TODOS LOS PRESUPUESTOS
    const presupuestosRes = await pool.request().query(`
      SELECT PRESUPUESTO, ESTADO
      FROM ARCHIVOPRESUPUESTO
      ORDER BY PRESUPUESTO ASC
    `);

    const presupuestos = presupuestosRes.recordset;

    const resultadoFinal = [];

    // 2) RECORRER CADA PRESUPUESTO
    for (const p of presupuestos) {
      // 2.1) BUSCAR PRODUCTOS ASOCIADOS
      const productosRes = await pool.request().input("pres", p.PRESUPUESTO)
        .query(`
          SELECT TIPO, ID_PRODUCTO, CANTIDAD
          FROM CONTROLSTOCK
          WHERE PRESUPUESTO = @pres
        `);

      const productos = [];

      // 2.2) BUSCAR REFERENCIA DE PAGO (SI EXISTE)
      const refRes = await pool.request().input("pres", p.PRESUPUESTO).query(`
            SELECT REFERENCIA
            FROM REFERENCIAPAGO
            WHERE PRESUPUESTO = @pres
          `);

      const referenciaPago =
        refRes.recordset.length > 0
          ? refRes.recordset[0].REFERENCIA
          : "No posee";

      // 3) ARMAR ARRAY DE PRODUCTOS PARA ESTE PRESUPUESTO
      for (const prod of productosRes.recordset) {
        let descripcion = "";

        if (prod.TIPO === "ACCESORIOS") {
          const acc = await pool.request().input("id", prod.ID_PRODUCTO).query(`
              SELECT descripcion AS descripcion
              FROM ACCESORIOS
              WHERE id_producto = @id
            `);

          descripcion = acc.recordset[0]?.descripcion || "Sin descripción";
        }

        if (prod.TIPO === "TEJIDOS") {
          const tej = await pool.request().input("id", prod.ID_PRODUCTO).query(`
              SELECT descripcion + ' ' + cal + ' ' + pul + ' ' + alt + ' ' + long AS descripcion
              FROM TEJIDOS
              WHERE id_producto = @id
            `);

          descripcion = tej.recordset[0]?.descripcion || "Sin descripción";
        }

        productos.push({
          id: prod.ID_PRODUCTO,
          descripcion,
          cantidad: prod.CANTIDAD,
          tipo: prod.TIPO,
        });
      }

      // 4) PUSH DEL OBJETO COMPLETO
      resultadoFinal.push({
        PRESUPUESTO: p.PRESUPUESTO,
        ESTADO: p.ESTADO,
        REFERENCIA_PAGO: referenciaPago,
        PRODUCTOS: productos,
      });
    }

    res.json(resultadoFinal);
  } catch (err) {
    console.error("Error en /presupuestos/gestion:", err);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
};

exports.generarPresupuesto = async (req, res) => {
  try {
    const {
      cliente,
      items,
      total,
      vendedor,
      trabajo,
      condicionPago,
      referenciaPago,
      validez,
    } = req.body;

    const pool = await poolPromise;

    // ======================================================
    // 1) OBTENER NUEVO NÚMERO DE PRESUPUESTO
    // ======================================================
    const queryVar = await pool.request().query(`
      SELECT PRESUPUESTO FROM VARIABLES
    `);

    const nuevoNum = queryVar.recordset[0].PRESUPUESTO + 1;

    // Guardar nuevo número
    await pool.request().query(`
      UPDATE VARIABLES SET PRESUPUESTO = ${nuevoNum}
    `);

    const presupuestoNumero = nuevoNum.toString();
    // ======================================================
    // 2) FORMATEO DE DATOS PARA EL PDF
    // ======================================================
    function formatoPrecio(num) {
      return num
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function fechaArgentina() {
      const offset = -3;
      const now = new Date();
      const local = new Date(now.getTime() + offset * 60 * 60 * 1000);

      const d = String(local.getUTCDate()).padStart(2, "0");
      const m = String(local.getUTCMonth() + 1).padStart(2, "0");
      const y = local.getUTCFullYear();
      return `${d}/${m}/${y}`;
    }

    const fecha = fechaArgentina();

    const data = {
      cliente,
      items: items.map((i) => ({
        cantidad: i.cantidad,
        descripcion: i.nombre || i.descripcion,
        precio_unitario: formatoPrecio(i.precio),
        precio_total: formatoPrecio(i.subtotal),
      })),
      total: formatoPrecio(total),
      trabajo: trabajo || "No indicado",
      vendedor: vendedor || "No indicado",
      validez: validez || "A determinar",
      condicionPago: condicionPago || "Contado",
      presupuestoNumero,
      fecha,
    };

    // ======================================================
    // 3) GENERAR PDF (TAL COMO TENÍAS)
    // ======================================================
    const pdf = await generarPDF(data);

    // ======================================================
    // 4) GUARDAR PDF + ITEMS EN BD
    // ======================================================
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);

    const nombreArchivo = `PRESUPUESTO-${presupuestoNumero}`;

    // 4.1 Guardar PDF en ARCHIVOPRESUPUESTO
    const req1 = new sql.Request(transaction);
    req1.input("PRESUPUESTO", sql.NVarChar, presupuestoNumero);
    req1.input("NOMBRE", sql.NVarChar, nombreArchivo);
    req1.input("FORMATO", sql.NVarChar, ".pdf");
    req1.input("ARCHIVO", sql.VarBinary(sql.MAX), pdfBuffer);
    req1.input("ESTADO", sql.NVarChar, "A CONFIRMAR");

    await req1.query(`
      INSERT INTO ARCHIVOPRESUPUESTO
      (PRESUPUESTO, NOMBRE_DE_ARCHIVO, FORMATO, ARCHIVO, ESTADO)
      VALUES (@PRESUPUESTO, @NOMBRE, @FORMATO, @ARCHIVO, @ESTADO)
    `);

    // 4.1.b Guardar referencia de pago
    if (referenciaPago) {
      const reqRef = new sql.Request(transaction);

      reqRef.input("PRESUPUESTO", sql.NVarChar, presupuestoNumero);
      reqRef.input("REFERENCIA", sql.NVarChar, referenciaPago);

      await reqRef.query(`
    INSERT INTO REFERENCIAPAGO (PRESUPUESTO, REFERENCIA)
    VALUES (@PRESUPUESTO, @REFERENCIA)
  `);
    }

    // 4.2 Guardar items en CONTROLSTOCK
    for (const item of items) {
      const req2 = new sql.Request(transaction);

      req2.input("PRESUPUESTO", sql.NVarChar, presupuestoNumero);
      req2.input("TIPO", sql.NVarChar, item.categoria.toUpperCase());
      req2.input("ID_PRODUCTO", sql.NVarChar, String(item.id));
      req2.input("CANTIDAD", sql.Int, item.cantidad);

      await req2.query(`
        INSERT INTO CONTROLSTOCK (PRESUPUESTO, TIPO, ID_PRODUCTO, CANTIDAD)
        VALUES (@PRESUPUESTO, @TIPO, @ID_PRODUCTO, @CANTIDAD)
      `);
    }

    await transaction.commit();

    // ======================================================
    // 5) RESPUESTA — DEVOLVER EL PDF COMO SIEMPRE
    // ======================================================
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=PRESUPUESTO ${presupuestoNumero}.pdf`
    );
    // 👇 clave
    res.setHeader("X-Presupuesto-Numero", presupuestoNumero);

    return res.end(pdf);
  } catch (error) {
    console.error("❌ Error al generar presupuesto:", error);
    return res.status(500).json({ error: "Error generando el presupuesto" });
  }
};
