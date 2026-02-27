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
  const {
    presupuesto,
    nuevoEstado,
    productos,
    tipoEntrega,
    fechaEntrega,
    horaEntrega,
    direccion,
    linkMaps,
    datosAdicionales,
    metodoPago, // 👈 NUEVO (solo cuando ENTREGADO)
  } = req.body;

  if (!presupuesto || !nuevoEstado) {
    return res.status(400).json({
      error: "Faltan datos: presupuesto o nuevoEstado.",
    });
  }

  let transaction;

  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // =====================================
    // 1️⃣ OBTENER ESTADO + DATOS ACTUALES
    // =====================================
    const reqEstado = new sql.Request(transaction);

    const estadoActualResult = await reqEstado.input(
      "PRESUPUESTO",
      sql.NVarChar,
      presupuesto,
    ).query(`
        SELECT ESTADO, DATOS_ADICIONALES
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

    let datosPrevios = {};

    if (estadoActualResult.recordset[0].DATOS_ADICIONALES) {
      try {
        datosPrevios = JSON.parse(
          estadoActualResult.recordset[0].DATOS_ADICIONALES,
        );
      } catch (e) {
        datosPrevios = {};
      }
    }

    // =====================================
    // 2️⃣ ARMAR NUEVO JSON SEGÚN ESTADO
    // =====================================
    let datosJson = null;
    let fechaEntregaReal = null;

    // 🔵 CUANDO PASA A PREPARAR
    if (nuevoEstado === "PREPARAR") {
      const payloadEntrega = {
        ...datosPrevios,
        tipoEntrega: tipoEntrega || null,
        fechaEntrega: fechaEntrega || null,
        horaEntrega: horaEntrega || null,
        direccion: direccion || null,
        linkMaps: linkMaps || null,
        datosAdicionales: datosAdicionales || null,
        fechaRegistro: new Date().toISOString(),
      };

      datosJson = JSON.stringify(payloadEntrega);
    }

    // 🟢 CUANDO PASA A ENTREGADO
    if (nuevoEstado === "CONFIRMADO") {
      const ahora = new Date();

      const payloadActualizado = {
        ...datosPrevios,
        metodoPago: metodoPago || null,
        fechaEntregaReal: ahora.toISOString(),
      };

      datosJson = JSON.stringify(payloadActualizado);
      fechaEntregaReal = ahora;
    }

    // =====================================
    // 3️⃣ UPDATE PRINCIPAL
    // =====================================
    const reqUpdate = new sql.Request(transaction);

    reqUpdate
      .input("PRESUPUESTO", sql.NVarChar, presupuesto)
      .input("ESTADO", sql.NVarChar, nuevoEstado)
      .input("DATOS_ADICIONALES", sql.NVarChar(sql.MAX), datosJson);

    if (fechaEntregaReal) {
      reqUpdate.input("FECHA_ENTREGA", sql.DateTime, fechaEntregaReal);
    }

    await reqUpdate.query(`
      UPDATE ARCHIVOPRESUPUESTO
      SET ESTADO = @ESTADO,
          DATOS_ADICIONALES = CASE 
                                WHEN @DATOS_ADICIONALES IS NOT NULL 
                                THEN @DATOS_ADICIONALES 
                                ELSE DATOS_ADICIONALES 
                              END
          ${fechaEntregaReal ? ", FECHA_ENTREGA = @FECHA_ENTREGA" : ""}
      WHERE PRESUPUESTO = @PRESUPUESTO
    `);

    // =====================================
    // 4️⃣ DESCONTAR STOCK SI PREPARAR
    // =====================================
    if (nuevoEstado === "PREPARAR") {
      if (!Array.isArray(productos)) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Debes enviar productos para preparar el presupuesto.",
        });
      }

      for (const prod of productos) {
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
          .input("CANTIDAD", sql.Numeric(10, 2), prod.cantidad).query(`
            UPDATE ${tabla}
            SET stock = stock - @CANTIDAD
            WHERE id_producto = @ID_PRODUCTO
          `);
      }
    }

    // =====================================
    // 5️⃣ DEVOLVER STOCK SI RECHAZADO
    // =====================================
    if (nuevoEstado === "RECHAZADO" && estadoAnterior === "PREPARAR") {
      for (const prod of productos || []) {
        if (prod.tipo === "SERVICIO") continue;

        const tabla =
          prod.tipo === "ACCESORIOS"
            ? "ACCESORIOS"
            : prod.tipo === "TEJIDOS"
              ? "TEJIDOS"
              : null;

        if (!tabla) continue;

        const req2 = new sql.Request(transaction);
        await req2
          .input("ID_PRODUCTO", sql.NVarChar, prod.id)
          .input("CANTIDAD", sql.Numeric(10, 2), prod.cantidad).query(`
            UPDATE ${tabla}
            SET stock = stock + @CANTIDAD
            WHERE id_producto = @ID_PRODUCTO
          `);
      }
    }

    // =====================================
    // 6️⃣ COMMIT
    // =====================================
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

    const result = await pool.request().query(`
      SELECT 
        p.PRESUPUESTO,
        p.ESTADO,
        p.DATOS_ADICIONALES,
        p.FECHA_ENTREGA,
        rp.REFERENCIA,
        cs.TIPO,
        cs.ID_PRODUCTO,
        cs.CANTIDAD,

        CASE 
          WHEN cs.TIPO = 'ACCESORIOS' THEN a.descripcion
          WHEN cs.TIPO = 'TEJIDOS' 
            THEN t.descripcion + ' ' + t.cal + ' ' + t.pul + ' ' + t.alt + ' ' + t.long
        END AS descripcion

      FROM ARCHIVOPRESUPUESTO p

      LEFT JOIN CONTROLSTOCK cs 
        ON p.PRESUPUESTO = cs.PRESUPUESTO

      LEFT JOIN REFERENCIAPAGO rp
        ON p.PRESUPUESTO = rp.PRESUPUESTO

      LEFT JOIN ACCESORIOS a
        ON cs.TIPO = 'ACCESORIOS'
        AND TRY_CAST(cs.ID_PRODUCTO AS INT) = a.id_producto

      LEFT JOIN TEJIDOS t
        ON cs.TIPO = 'TEJIDOS'
        AND TRY_CAST(cs.ID_PRODUCTO AS INT) = t.id_producto


      ORDER BY p.PRESUPUESTO ASC
    `);

    const rows = result.recordset;

    const map = {};

    for (const row of rows) {
      if (!map[row.PRESUPUESTO]) {
        let datosParsed = null;

        if (row.DATOS_ADICIONALES) {
          try {
            datosParsed = JSON.parse(row.DATOS_ADICIONALES);
          } catch (e) {
            console.warn("Error parseando DATOS_ADICIONALES", e);
          }
        }

        map[row.PRESUPUESTO] = {
          PRESUPUESTO: row.PRESUPUESTO,
          ESTADO: row.ESTADO,
          REFERENCIA_PAGO: row.REFERENCIA || "No posee",
          DATOS_ADICIONALES: datosParsed,
          FECHA_ENTREGA: row.FECHA_ENTREGA || null,
          PRODUCTOS: [],
        };
      }

      if (row.ID_PRODUCTO) {
        map[row.PRESUPUESTO].PRODUCTOS.push({
          id: row.ID_PRODUCTO,
          descripcion: row.descripcion,
          cantidad: row.CANTIDAD,
          tipo: row.TIPO,
        });
      }
    }

    res.json(Object.values(map));
  } catch (err) {
    console.error("Error en gestionarPresupuestos:", err);
    res.status(500).json({ error: "Error interno" });
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

    const nuevoNum = queryVar.recordset[0].PRESUPUESTO;
    const nuevoValorPresupuesto = queryVar.recordset[0].PRESUPUESTO + 1;

    // Guardar nuevo número
    await pool.request().query(`
      UPDATE VARIABLES SET PRESUPUESTO = ${nuevoValorPresupuesto}
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

    const datosAdicionales = JSON.stringify({
      total: total,
    });
    // 4.1 Guardar PDF en ARCHIVOPRESUPUESTO
    const req1 = new sql.Request(transaction);
    req1.input("PRESUPUESTO", sql.NVarChar, presupuestoNumero);
    req1.input("NOMBRE", sql.NVarChar, nombreArchivo);
    req1.input("FORMATO", sql.NVarChar, ".pdf");
    req1.input("ARCHIVO", sql.VarBinary(sql.MAX), pdfBuffer);
    req1.input("ESTADO", sql.NVarChar, "A CONFIRMAR");
    req1.input("DATOS_ADICIONALES", sql.NVarChar(sql.MAX), datosAdicionales);

    await req1.query(`
      INSERT INTO ARCHIVOPRESUPUESTO
      (PRESUPUESTO, NOMBRE_DE_ARCHIVO, FORMATO, ARCHIVO, ESTADO, DATOS_ADICIONALES)
      VALUES (@PRESUPUESTO, @NOMBRE, @FORMATO, @ARCHIVO, @ESTADO, @DATOS_ADICIONALES)
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
      req2.input("CANTIDAD", sql.Numeric(10, 2), item.cantidad);

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
      `attachment; filename=PRESUPUESTO ${presupuestoNumero}.pdf`,
    );
    // 👇 clave
    res.setHeader("X-Presupuesto-Numero", presupuestoNumero);

    return res.end(pdf);
  } catch (error) {
    console.error("❌ Error al generar presupuesto:", error);
    return res.status(500).json({ error: "Error generando el presupuesto" });
  }
};

exports.borrarRechazados = async (req, res) => {
  let transaction;

  try {
    const pool = await poolPromise;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const req1 = new sql.Request(transaction);

    const deleteStock = await req1.query(`
      DELETE FROM CONTROLSTOCK
      WHERE PRESUPUESTO IN (
        SELECT PRESUPUESTO
        FROM ARCHIVOPRESUPUESTO
        WHERE ESTADO = 'RECHAZADO'
      )
    `);

    const req2 = new sql.Request(transaction);

    const deleteRef = await req2.query(`
      DELETE FROM REFERENCIAPAGO
      WHERE PRESUPUESTO IN (
        SELECT PRESUPUESTO
        FROM ARCHIVOPRESUPUESTO
        WHERE ESTADO = 'RECHAZADO'
      )
    `);

    const req3 = new sql.Request(transaction);

    const deleteArchivos = await req3.query(`
      DELETE FROM ARCHIVOPRESUPUESTO
      WHERE ESTADO = 'RECHAZADO'
    `);

    await transaction.commit();

    return res.json({
      ok: true,
      eliminados: deleteArchivos.rowsAffected[0],
      msg: `${deleteArchivos.rowsAffected[0]} presupuestos eliminados`,
    });
  } catch (err) {
    if (transaction) await transaction.rollback();

    console.error("Error borrando rechazados:", err);

    return res.status(500).json({
      error: "Error interno",
    });
  }
};
