import { animateFadeUp } from "../../utils/animate";

export function renderManageClients(container) {
  container.innerHTML = `
    <main class="container-fluid py-5">
      <div class="row g-4">

        <!-- =========================
            FORMULARIO
        ========================== -->
        <div class="col-12 col-lg-4">
          <div class="card shadow-sm fade-up">
            <div class="card-body">

              <h6 class="fw-bold mb-3">Gestión de Clientes</h6>

              <div class="mb-3">
                <label class="form-label fw-semibold">Apellido</label>
                <input id="inputApellido" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Nombre</label>
                <input id="inputNombre" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">DNI</label>
                <input id="inputDni" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">CUIT</label>
                <input id="inputCuit" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Empresa</label>
                <input id="inputEmpresa" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Dirección</label>
                <input id="inputDireccion" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">C.P.</label>
                <input id="inputCp" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Teléfono</label>
                <input id="inputTelefono" class="form-control" />
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold">E-mail</label>
                <input id="inputEmail" type="email" class="form-control" />
              </div>

              <!-- BOTONES -->
              <div class="d-grid gap-2">
                <button id="btnAgregar" class="btn btn-success">Agregar</button>
                <button id="btnModificar" class="btn btn-primary" disabled>
                  Modificar
                </button>
                <button id="btnEliminar" class="btn btn-danger" disabled>
                  Eliminar
                </button>
                <button id="btnLimpiar" class="btn btn-outline-secondary">
                  Limpiar
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- =========================
            TABLA
        ========================== -->
        
        <div class="col-12 col-lg-8">
        <!-- =========================
            FILTRO DE CLIENTES
        ========================== -->
        <div class="card shadow-sm fade-up mb-3">
          <div class="card-body py-3">

            <div class="row align-items-center g-2">
              <div class="col-12 col-md-4">
                <h6 class="fw-bold mb-0">Filtrar clientes</h6>
                <small class="text-muted">
                  Apellido, nombre o teléfono
                </small>
              </div>

              <div class="col-12 col-md-8">
                <input
                  id="inputFiltroClientes"
                  type="text"
                  class="form-control"
                  placeholder="Escriba para filtrar…"
                />
              </div>
            </div>

          </div>
        </div>

          <div class="card shadow-sm fade-up">
            <div class="card-body">

              <h6 class="fw-bold mb-3">Clientes</h6>

              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Apellido</th>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>CUIT</th>
                      <th>Empresa</th>
                      <th>Teléfono</th>
                      <th>E-mail</th>
                    </tr>
                  </thead>
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
    </main>
  `;

  animateFadeUp(container);

  // =============================
  // 🧠 ESTADO
  // =============================
  let clientes = [];
  let seleccionado = null;
  let filaSeleccionada = null;

  const PAGE_SIZE = 20;
  let paginaActual = 1;

  let clientesFiltrados = [];

  // =============================
  // 📌 DOM
  // =============================
  const apellido = container.querySelector("#inputApellido");
  const nombre = container.querySelector("#inputNombre");
  const dni = container.querySelector("#inputDni");
  const cuit = container.querySelector("#inputCuit");
  const empresa = container.querySelector("#inputEmpresa");
  const direccion = container.querySelector("#inputDireccion");
  const cp = container.querySelector("#inputCp");
  const telefono = container.querySelector("#inputTelefono");
  const email = container.querySelector("#inputEmail");

  const btnAgregar = container.querySelector("#btnAgregar");
  const btnModificar = container.querySelector("#btnModificar");
  const btnEliminar = container.querySelector("#btnEliminar");
  const btnLimpiar = container.querySelector("#btnLimpiar");

  const tablaBody = container.querySelector("#tablaBody");
  const btnPrev = container.querySelector("#btnPrev");
  const btnNext = container.querySelector("#btnNext");
  const pageInfo = container.querySelector("#pageInfo");

  const inputFiltroClientes = container.querySelector("#inputFiltroClientes");

  // =============================
  // 🔄 CARGAR
  // =============================
  async function cargar() {
    Swal.fire({
      title: "Cargando clientes",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const resp = await fetch("/api/clientes");
      clientes = await resp.json();
      clientesFiltrados = [...clientes];
      paginaActual = 1;
      renderTabla();
    } finally {
      Swal.close();
    }
  }

  // =============================
  // 🧾 TABLA
  // =============================
  function renderTabla() {
    const totalPaginas = Math.ceil(clientesFiltrados.length / PAGE_SIZE);

    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas || 1;

    const inicio = (paginaActual - 1) * PAGE_SIZE;
    const fin = inicio + PAGE_SIZE;

    tablaBody.innerHTML = "";

    clientesFiltrados.slice(inicio, fin).forEach((c) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${c.apellido}</td>
        <td>${c.nombre}</td>
        <td>${c.dni}</td>
        <td>${c.cuit || ""}</td>
        <td>${c.empresa || ""}</td>
        <td>${c.telefono || ""}</td>
        <td>${c.email || ""}</td>
      `;

      tr.addEventListener("click", () => seleccionar(c, tr));
      tablaBody.appendChild(tr);
    });

    pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;
    btnPrev.disabled = paginaActual === 1;
    btnNext.disabled = paginaActual === totalPaginas || totalPaginas === 0;
  }

  // =============================
  // ✏️ SELECCIONAR
  // =============================
  function seleccionar(c, tr) {
    seleccionado = c;

    if (filaSeleccionada) {
      filaSeleccionada.classList.remove("table-primary");
    }

    filaSeleccionada = tr;
    tr.classList.add("table-primary");

    apellido.value = c.apellido;
    nombre.value = c.nombre;
    dni.value = c.dni;
    cuit.value = c.cuit || "";
    empresa.value = c.empresa || "";
    direccion.value = c.direccion || "";
    cp.value = c.codigo_postal || "";
    telefono.value = c.telefono || "";
    email.value = c.email || "";

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
      filaSeleccionada = null;
    }

    apellido.value =
      nombre.value =
      dni.value =
      cuit.value =
      empresa.value =
      direccion.value =
      cp.value =
      telefono.value =
      email.value =
        "";

    btnAgregar.disabled = false;
    btnModificar.disabled = true;
    btnEliminar.disabled = true;
  }

  // =============================
  // ➕ / ✏️ / ❌
  // =============================
  async function enviar(method) {
    if (!apellido.value.trim() || !telefono.value.trim()) {
      return Swal.fire(
        "Atención",
        "Apellido y Teléfono son obligatorios",
        "warning",
      );
    }

    const payload = {
      apellido: apellido.value,
      nombre: nombre.value,
      dni: dni.value,
      cuit: cuit.value,
      empresa: empresa.value,
      direccion: direccion.value,
      codigo_postal: cp.value,
      telefono: telefono.value,
      email: email.value,
    };

    const url =
      method === "POST" ? "/api/clientes" : `/api/clientes/${seleccionado.id}`;

    Swal.fire({
      title: method === "POST" ? "Agregando cliente" : "Actualizando cliente",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title:
          method === "POST"
            ? "Cliente creado correctamente"
            : "Cliente actualizado correctamente",
        timer: 1400,
        showConfirmButton: false,
      });

      limpiar();
      await cargar();
    } catch {
      Swal.fire("Error", "No se pudo guardar el cliente", "error");
    }
  }

  btnAgregar.onclick = () => enviar("POST");
  btnModificar.onclick = () => enviar("PUT");

  btnEliminar.onclick = async () => {
    if (!seleccionado) return;

    const r = await Swal.fire({
      title: "Eliminar cliente",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!r.isConfirmed) return;

    try {
      await fetch(`/api/clientes/${seleccionado.id}`, { method: "DELETE" });
      await Swal.fire({
        icon: "success",
        title: "Cliente eliminado correctamente",
        timer: 1400,
        showConfirmButton: false,
      });
      limpiar();
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el cliente", "error");
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

  inputFiltroClientes.addEventListener("input", () => {
    const filtro = inputFiltroClientes.value.toLowerCase().trim();

    clientesFiltrados = clientes.filter((c) => {
      return (
        c.apellido?.toLowerCase().includes(filtro) ||
        c.nombre?.toLowerCase().includes(filtro) ||
        c.telefono?.toLowerCase().includes(filtro)
      );
    });

    paginaActual = 1;
    limpiar();
    renderTabla();
  });

  btnLimpiar.onclick = limpiar;

  // 🚀 INIT
  cargar();
}
