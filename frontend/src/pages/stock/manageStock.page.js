import { animateFadeUp } from "../../utils/animate";

export function renderManageStock(container) {
  container.innerHTML = `
    <main class="container-fluid py-5">
      <div class="row g-4">

        <!-- =========================
            FORMULARIO
        ========================== -->
        <div class="col-12 col-lg-4">
          <div class="card shadow-sm fade-up">
            <div class="card-body">

              <h6 class="fw-bold mb-3">Control de Inventario</h6>

              <!-- TIPO -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Tipo</label>
                <select id="tipoProducto" class="form-select">
                  <option value="ACCESORIOS">Accesorios</option>
                  <option value="TEJIDOS">Tejidos</option>
                </select>
              </div>

              <!-- DESCRIPCIÓN -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Descripción</label>
                <input id="inputDescripcion" class="form-control" />
              </div>

              <!-- CAMPOS TEJIDOS -->
              <div id="tejidosFields" class="d-none">

                <div class="mb-3">
                  <label class="form-label fw-semibold">Calibre</label>
                  <input id="inputCalibre" class="form-control" />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Pulgada</label>
                  <input id="inputPulgada" class="form-control" />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Altura</label>
                  <input id="inputAltura" class="form-control" />
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold">Longitud</label>
                  <input id="inputLongitud" class="form-control" />
                </div>

              </div>

              <!-- COMUNES -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Stock</label>
                <input id="inputStock" type="number" step="0.1" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Precio contado</label>
                <input id="inputPrecio" type="text" inputmode="decimal" class="form-control" />
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold">Precio lista</label>
                <input id="inputPrecioLista" type="text" inputmode="decimal" class="form-control" />
              </div>

              <!-- BOTONES -->
              <div class="d-grid gap-2">
                <button id="btnAgregar" class="btn btn-success">Agregar</button>
                <button id="btnModificar" class="btn btn-primary" disabled>Modificar</button>
                <button id="btnEliminar" class="btn btn-danger" disabled>Eliminar</button>
                <button id="btnLimpiar" class="btn btn-outline-secondary">Limpiar</button>
              </div>

            </div>
          </div>
        </div>

        <!-- =========================
            TABLA
        ========================== -->
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm fade-up">
            <div class="card-body">

              <h6 class="fw-bold mb-3">Productos</h6>

              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light" id="tablaHead"></thead>
                  <tbody id="tablaBody"></tbody>
                </table>
                  <div class="d-flex justify-content-between align-items-center mt-3">
                    <button id="btnPrev" class="btn btn-outline-secondary btn-sm">
                      ◀ Anterior
                    </button>

                    <span id="pageInfo" class="small fw-semibold"></span>

                    <button id="btnNext" class="btn btn-outline-secondary btn-sm">
                      Siguiente ▶
                    </button>
                  </div>
              </div>

            </div>
          </div>
        </div>

      </div>
      <!-- =========================
     EXPORTAR INVENTARIO
      ========================== -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card shadow-sm fade-up">
            <div class="card-body py-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 class="fw-bold mb-0">Exportar inventario</h6>
                <small class="text-muted">
                  Descargar listado completo en Excel (Accesorios y Tejidos)
                </small>
              </div>

              <button
                id="btnExportarExcel"
                class="btn btn-outline-success"
              >
                📊 Exportar Inventario a Excel
              </button>
            </div>
          </div>
        </div>
      </div>

    </main>
  `;

  animateFadeUp(container);

  // =============================
  // 🧠 ESTADO
  // =============================
  let productos = [];
  let seleccionado = null;
  let filaSeleccionada = null;
  const PAGE_SIZE = 13;
  let paginaActual = 1;

  // =============================
  // 📌 DOM
  // =============================
  const tipo = container.querySelector("#tipoProducto");
  const tejidosFields = container.querySelector("#tejidosFields");

  const descripcion = container.querySelector("#inputDescripcion");
  const calibre = container.querySelector("#inputCalibre");
  const pulgada = container.querySelector("#inputPulgada");
  const altura = container.querySelector("#inputAltura");
  const longitud = container.querySelector("#inputLongitud");

  const stock = container.querySelector("#inputStock");
  const precio = container.querySelector("#inputPrecio");
  const precioLista = container.querySelector("#inputPrecioLista");

  const btnAgregar = container.querySelector("#btnAgregar");
  const btnModificar = container.querySelector("#btnModificar");
  const btnEliminar = container.querySelector("#btnEliminar");
  const btnLimpiar = container.querySelector("#btnLimpiar");

  const tablaHead = container.querySelector("#tablaHead");
  const tablaBody = container.querySelector("#tablaBody");
  const btnPrev = container.querySelector("#btnPrev");
  const btnNext = container.querySelector("#btnNext");
  const pageInfo = container.querySelector("#pageInfo");

  const btnExportarExcel = container.querySelector("#btnExportarExcel");

  function parseDecimal(value) {
    if (typeof value !== "string") return Number(value);
    return Number(value.replace(",", "."));
  }

  // =============================
  // 🔄 CARGAR
  // =============================
  async function cargar() {
    Swal.fire({
      title: "Cargando inventario",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const resp = await fetch("/api/productos");
      let data = await resp.json();

      // 🔹 filtrar por categoría seleccionada
      productos = data.filter((p) => p.categoria.toUpperCase() === tipo.value);

      productos = productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion ?? p.nombre,
        cal: p.cal ?? null,
        pul: p.pul ?? null,
        alt: p.alt ?? null,
        long: p.long ?? null,
        stock: Number(p.stock),
        precio: Number(p.precio),
        precio_lista: Number(p.precio_lista),
        categoria: p.categoria.toUpperCase(),
      }));

      paginaActual = 1;
      renderTabla();

      paginaActual = 1; // 👈 reset
      renderTabla();
    } finally {
      Swal.close();
    }
  }

  // =============================
  // 🧾 TABLA
  // =============================
  function renderTabla() {
    const totalPaginas = Math.ceil(productos.length / PAGE_SIZE);

    // clamp por seguridad
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;
    if (paginaActual < 1) paginaActual = 1;

    const inicio = (paginaActual - 1) * PAGE_SIZE;
    const fin = inicio + PAGE_SIZE;

    const paginaProductos = productos.slice(inicio, fin);

    // HEAD
    tablaHead.innerHTML =
      tipo.value === "TEJIDOS"
        ? `
        <tr>
          <th>Descripción</th><th>Cal</th><th>Pulg</th>
          <th>Alt</th><th>Long</th>
          <th class="text-center">Stock</th>
          <th class="text-end">Contado</th>
          <th class="text-end">Lista</th>
        </tr>`
        : `
        <tr>
          <th>Descripción</th>
          <th class="text-center">Stock</th>
          <th class="text-end">Contado</th>
          <th class="text-end">Lista</th>
        </tr>`;

    tablaBody.innerHTML = "";

    paginaProductos.forEach((p) => {
      const tr = document.createElement("tr");

      // 🔴 stock cero
      if (Number(p.stock) === 0) {
        tr.classList.add("table-danger");
        tr.dataset.sinStock = "1";
      }

      tr.innerHTML =
        tipo.value === "TEJIDOS"
          ? `
          <td>${p.descripcion}</td>
          <td>${p.cal}</td>
          <td>${p.pul}</td>
          <td>${p.alt}</td>
          <td>${p.long}</td>
          <td class="text-center">${p.stock}</td>
          <td class="text-end">$ ${new Intl.NumberFormat("es-AR").format(p.precio)}</td>
          <td class="text-end">$ ${new Intl.NumberFormat("es-AR").format(p.precio_lista)}</td>`
          : `
          <td>${p.nombre}</td>
          <td class="text-center">${p.stock}</td>
          <td class="text-end">$ ${new Intl.NumberFormat("es-AR").format(p.precio)}</td>
          <td class="text-end">$ ${new Intl.NumberFormat("es-AR").format(p.precio_lista)}</td>`;

      tr.addEventListener("click", () => seleccionar(p, tr));
      tablaBody.appendChild(tr);
    });

    // 📄 info y botones
    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;

    btnPrev.disabled = paginaActual === 1;
    btnNext.disabled = paginaActual === totalPaginas || totalPaginas === 0;
  }

  // =============================
  // ✏️ SELECCIONAR
  // =============================
  function seleccionar(p, tr) {
    seleccionado = p;

    // limpiar selección anterior
    if (filaSeleccionada) {
      filaSeleccionada.classList.remove("table-primary");

      // 🔴 restaurar danger si correspondía
      if (filaSeleccionada.dataset.sinStock === "1") {
        filaSeleccionada.classList.add("table-danger");
      }
    }

    filaSeleccionada = tr;

    // 🎯 quitar danger y resaltar
    tr.classList.remove("table-danger");
    tr.classList.add("table-primary");

    stock.value = p.stock;
    precio.value = p.precio;
    precioLista.value = p.precio_lista;

    if (tipo.value === "TEJIDOS") {
      descripcion.value = p.descripcion;
      calibre.value = p.cal;
      pulgada.value = p.pul;
      altura.value = p.alt;
      longitud.value = p.long;
    } else {
      descripcion.value = p.nombre;
    }

    btnAgregar.disabled = true;
    btnModificar.disabled = false;
    btnEliminar.disabled = false;
  }

  // =============================
  // 🧹 LIMPIAR
  // =============================
  function limpiar() {
    seleccionado = null;

    if (filaSeleccionada) {
      filaSeleccionada.classList.remove("table-primary");

      if (filaSeleccionada.dataset.sinStock === "1") {
        filaSeleccionada.classList.add("table-danger");
      }

      filaSeleccionada = null;
    }

    descripcion.value = "";
    stock.value = "";
    precio.value = "";
    precioLista.value = "";
    calibre.value = pulgada.value = altura.value = longitud.value = "";

    btnAgregar.disabled = false;
    btnModificar.disabled = true;
    btnEliminar.disabled = true;
  }

  // =============================
  // ➕ AGREGAR / ✏️ MODIFICAR / ❌ ELIMINAR
  // =============================
  async function enviar(method) {
    if (!descripcion.value.trim()) {
      return Swal.fire("Atención", "La descripción es obligatoria", "warning");
    }

    if (stock.value === "" || isNaN(Number(stock.value))) {
      return Swal.fire("Atención", "Stock inválido", "warning");
    }

    if (precio.value === "" || isNaN(Number(precio.value))) {
      return Swal.fire("Atención", "Precio contado inválido", "warning");
    }

    if (precioLista.value === "" || isNaN(Number(precioLista.value))) {
      return Swal.fire("Atención", "Precio lista inválido", "warning");
    }

    if (tipo.value === "TEJIDOS") {
      if (
        !calibre.value ||
        !pulgada.value ||
        !altura.value ||
        !longitud.value
      ) {
        return Swal.fire(
          "Atención",
          "Complete todos los campos del tejido",
          "warning",
        );
      }
    }

    const payload = {
      tipo: tipo.value,
      descripcion: descripcion.value,
      stock: Number(stock.value),
      precio: parseDecimal(precio.value),
      precio_lista: parseDecimal(precioLista.value),
    };

    if (tipo.value === "TEJIDOS") {
      Object.assign(payload, {
        calibre: calibre.value,
        pulgada: pulgada.value,
        altura: altura.value,
        longitud: longitud.value,
      });
    }

    const url =
      method === "POST"
        ? "/api/productos"
        : `/api/productos/${seleccionado.id}`;

    Swal.fire({
      title: method === "POST" ? "Agregando producto" : "Actualizando producto",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Error backend");

      await Swal.fire({
        icon: "success",
        title:
          method === "POST"
            ? "Producto creado correctamente"
            : "Producto actualizado correctamente",
        timer: 1400,
        showConfirmButton: false,
      });

      limpiar();
      await cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar el producto", "error");
    }
  }

  btnAgregar.onclick = () => enviar("POST");
  btnModificar.onclick = () => enviar("PUT");

  btnEliminar.onclick = async () => {
    if (!seleccionado) return;

    const r = await Swal.fire({
      title: "Eliminar producto",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!r.isConfirmed) return;

    Swal.fire({
      title: "Eliminando producto",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const resp = await fetch(
        `/api/productos/${seleccionado.id}?tipo=${tipo.value}`,
        { method: "DELETE" },
      );

      if (!resp.ok) throw new Error("Error backend");

      await Swal.fire({
        icon: "success",
        title: "Producto eliminado correctamente",
        timer: 1400,
        showConfirmButton: false,
      });

      limpiar();
      await cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  };

  btnPrev.onclick = () => {
    paginaActual--;
    limpiar();
    renderTabla();
  };

  btnNext.onclick = () => {
    paginaActual++;
    limpiar();
    renderTabla();
  };

  btnLimpiar.onclick = limpiar;

  tipo.onchange = () => {
    tejidosFields.classList.toggle("d-none", tipo.value !== "TEJIDOS");
    limpiar();
    cargar();
  };

  btnExportarExcel.onclick = async () => {
    try {
      Swal.fire({
        title: "Generando Excel...",
        text: "Preparando archivo de inventario",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const resp = await fetch("/api/productos/excel");

      if (!resp.ok) {
        throw new Error("Error generando Excel");
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Inventario_Productos.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo generar el archivo Excel", "error");
    }
  };

  // 🚀 INIT
  cargar();
}
