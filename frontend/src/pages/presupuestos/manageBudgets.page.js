import { animateFadeUp } from "../../utils/animate";
import * as bootstrap from "bootstrap";

export function renderManageBudgets(container) {
  container.innerHTML = `
    <main class="container-fluid py-5">
      <div class="row g-4">

        <!-- =========================
            FILTROS
        ========================== -->
        <div class="col-12 col-lg-3">

          <div class="card shadow-sm fade-up">
            <div class="card-body">
              <h6 class="fw-bold mb-3">Filtrar por estado</h6>

              <div class="d-grid gap-2">
                ${["A CONFIRMAR", "PREPARAR", "ENTREGADO", "RECHAZADO"]
                  .map(
                    (e) => `
                  <button class="btn btn-outline-primary estado-btn"
                          data-estado="${e}">
                    ${e}
                  </button>
                `,
                  )
                  .join("")}
              </div>
            </div>
          </div>

        </div>

        <!-- =========================
            LISTADO
        ========================== -->
        <div class="col-12 col-lg-9">

          <div class="card shadow-sm fade-up">
            <div class="card-body">

              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0">Presupuestos</h6>
                <small id="totalCount" class="text-muted"></small>
                <div id="headerActions"></div>
              </div>


              <div class="table-responsive">
                <table class="table align-middle">
                  <thead class="table-light" id="budgetsHead"></thead>

                  <tbody id="budgetsTable"></tbody>
                </table>
                <div id="loadingState"
                    class="text-center py-4 d-none">
                  <div class="spinner-border text-primary mb-2"></div>
                  <div class="fw-semibold text-muted">
                    Cargando presupuestos...
                  </div>
                </div>

              </div>

              <div id="emptyState"
                   class="text-center text-muted py-4 d-none">
                No hay presupuestos en esta categoría.
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- =========================
           MODAL PRODUCTOS
      ========================== -->
      <div class="modal fade" id="productosModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold" id="productosModalLabel">
                Productos del presupuesto
              </h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="productosDetalle"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- =========================
          MODAL PREPARAR
      ========================== -->
      <div class="modal fade" id="prepararModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title fw-bold">
                Datos de entrega
              </h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="row g-3">

                <!-- TIPO -->
                <div class="col-12">
                  <label class="form-label">Tipo</label>
                  <select id="tipoEntrega" class="form-select">
                    <option value="ENTREGA">Retira por depósito</option>
                    <option value="ENVIO">Envío</option>
                  </select>
                </div>

                <!-- FECHA Y HORA -->
                <div class="col-md-6">
                  <label class="form-label">Fecha</label>
                  <input type="date" id="fechaEntrega" class="form-control">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Hora</label>
                  <input type="time" id="horaEntrega" class="form-control">
                </div>

                <!-- DATOS ADICIONALES -->
                <div class="col-12">
                  <label class="form-label">Datos adicionales</label>
                  <textarea id="datosAdicionales"
                    class="form-control"
                    rows="2"
                    placeholder="Ej: llamar antes de llegar, dejar en portería..."></textarea>

                </div>

                <!-- BLOQUE ENVÍO -->
                <div id="bloqueEnvio" class="d-none">

                  <div class="col-12">
                    <label class="form-label">Dirección</label>
                    <input id="direccionEntrega"
                          class="form-control mb-3"
                          placeholder="Dirección de entrega">
                    <small id="direccionWarning"
                          class="text-danger d-none mb-3">
                      No se encontró la dirección en el mapa
                    </small>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Link Google Maps</label>
                    <input id="linkMaps"
                          class="form-control mb-3"
                          placeholder="https://maps.google.com/...">
                  </div>

                  <div class="col-12">
                    <div id="mapPreview"
                        style="height:250px; border-radius:10px; overflow:hidden;">
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary"
                      data-bs-dismiss="modal">
                Cancelar
              </button>

              <button id="confirmarPreparar"
                      class="btn btn-success">
                Confirmar preparación
              </button>
            </div>

          </div>
        </div>
      </div>
      <!-- =========================
          MODAL ENTREGAR
      ========================== -->
      <div class="modal fade" id="entregarModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title fw-bold">
                Confirmar Entrega
              </h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <label class="form-label fw-semibold mb-2">
                Método de pago
              </label>

              <select id="metodoPagoSelect" class="form-select">
                <option value="">Seleccione...</option>
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="TRANSFERENCIA">🏦 Transferencia</option>
                <option value="TARJETA">💳 Tarjeta</option>
                <option value="DEBE">📄 Debe</option>
              </select>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary"
                      data-bs-dismiss="modal">
                Cancelar
              </button>

              <button id="confirmarEntrega"
                      class="btn btn-primary"
                      disabled>
                Confirmar entrega
              </button>
            </div>

          </div>
        </div>
      </div>



    </main>
  `;

  animateFadeUp(container);
  ejecutarManageBudgets(container);

  function ejecutarManageBudgets(container) {
    let coordsDireccion = null;
    let coordsLink = null;
    let direccionRequestId = 0;
    let linkRequestId = 0;

    const tbody = container.querySelector("#budgetsTable");
    const emptyState = container.querySelector("#emptyState");
    const totalCount = container.querySelector("#totalCount");
    const estadoBtns = container.querySelectorAll(".estado-btn");
    const tipoSelect = container.querySelector("#tipoEntrega");
    const bloqueEnvio = container.querySelector("#bloqueEnvio");
    const thead = container.querySelector("#budgetsHead");
    const entregarModal = new bootstrap.Modal(
      container.querySelector("#entregarModal"),
    );

    tipoSelect.addEventListener("change", () => {
      if (tipoSelect.value === "ENVIO") {
        bloqueEnvio.classList.remove("d-none");

        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 200);
      } else {
        bloqueEnvio.classList.add("d-none");
      }

      validarFormulario();
    });

    const fechaInput = container.querySelector("#fechaEntrega");

    fechaInput.addEventListener("input", () => {
      validarFormulario();
    });

    const horaInput = container.querySelector("#horaEntrega");

    horaInput.addEventListener("input", () => {
      validarFormulario();
    });

    let prepararModal = new bootstrap.Modal(
      container.querySelector("#prepararModal"),
    );

    let map;
    let marker;

    const productosModal = new bootstrap.Modal(
      container.querySelector("#productosModal"),
    );

    let presupuestos = [];
    let estadoActual = "A CONFIRMAR";

    const normalizarEstadoUI = (estado) =>
      estado === "CONFIRMADO" ? "ENTREGADO" : estado;

    const loadingState = container.querySelector("#loadingState");

    async function cargar() {
      try {
        loadingState.classList.remove("d-none");
        tbody.innerHTML = "";
        emptyState.classList.add("d-none");

        const resp = await fetch("/api/presupuestos/gestion", {
          method: "GET",
          credentials: "include",
        });

        if (!resp.ok) throw new Error();

        presupuestos = await resp.json();

        render();
      } catch (err) {
        Swal.fire("Error", "No se pudieron cargar los presupuestos", "error");
      } finally {
        loadingState.classList.add("d-none");
      }
    }

    function render() {
      // 🔹 HEADER DINÁMICO
      if (estadoActual === "PREPARAR") {
        thead.innerHTML = `
      <tr>
        <th>N°</th>
        <th>Estado</th>
        <th>Tipo Entrega</th>
        <th class="text-end">Acciones</th>
      </tr>
    `;
      } else if (estadoActual === "ENTREGADO") {
        thead.innerHTML = `
      <tr>
        <th>N°</th>
        <th>Estado</th>
        <th>Método de Pago</th>
        <th>Monto Total</th>
        <th>Fecha de Entrega</th>
        <th class="text-end">Acciones</th>
      </tr>
    `;
      } else {
        thead.innerHTML = `
      <tr>
        <th>N°</th>
        <th>Estado</th>
        <th class="text-end">Acciones</th>
      </tr>
    `;
      }
      const filtrados = presupuestos.filter(
        (p) => normalizarEstadoUI(p.ESTADO) === estadoActual,
      );

      totalCount.textContent = `${filtrados.length} resultados`;

      tbody.innerHTML = "";

      if (!filtrados.length) {
        emptyState.classList.remove("d-none");
        return;
      }

      emptyState.classList.add("d-none");

      const headerActions = container.querySelector("#headerActions");

      if (estadoActual === "RECHAZADO" && filtrados.length > 0) {
        headerActions.innerHTML = `
          <button id="btnBorrarRechazados"
                  class="btn btn-sm btn-danger">
            <i class="bi bi-trash3"></i>
            Eliminar todos los rechazados
          </button>
        `;

        container
          .querySelector("#btnBorrarRechazados")
          .addEventListener("click", borrarRechazados);
      } else {
        headerActions.innerHTML = "";
      }

      filtrados.forEach((p) => {
        const columnaEntrega =
          estadoActual === "PREPARAR" ? `<td>${renderTipoEntrega(p)}</td>` : "";

        const columnaPago =
          estadoActual === "ENTREGADO"
            ? `<td>${p.DATOS_ADICIONALES?.metodoPago || "-"}</td>`
            : "";
        const columnaMonto =
          estadoActual === "ENTREGADO"
            ? `<td>$${p.DATOS_ADICIONALES?.montoTotal || "-"}</td>`
            : "";
        const columnaFecha =
          estadoActual === "ENTREGADO"
            ? `<td>${
                p.FECHA_ENTREGA
                  ? p.FECHA_ENTREGA.split("T")[0].split("-").reverse().join("/")
                  : "-"
              }</td>`
            : "";

        const tr = document.createElement("tr");

        tr.innerHTML = `<td>#${p.PRESUPUESTO}</td>
        <td>
          <span class="badge bg-${colorEstado(p.ESTADO)}">
            ${normalizarEstadoUI(p.ESTADO)}
          </span>
        </td>

        ${columnaEntrega}
        ${columnaPago}
        ${columnaMonto}
        ${columnaFecha}
        <td class="text-end">
          <div class="btn-group btn-group-sm">

            <button class="btn btn-outline-secondary btn-ver"
                    title="Ver productos">
              <i class="bi bi-eye"></i>
            </button>

            ${renderBotones(p)}

            <button class="btn btn-outline-dark btn-pdf"
                    title="Descargar PDF">
              <i class="bi bi-file-earmark-pdf"></i>
            </button>

          </div>
        </td>

      `;

        // VER PRODUCTOS
        tr.querySelector(".btn-ver").addEventListener("click", () =>
          mostrarProductos(p),
        );

        // PDF
        tr.querySelector(".btn-pdf").addEventListener("click", () =>
          descargarPDF(p.PRESUPUESTO),
        );

        // ACCIONES
        tr.querySelectorAll("[data-action]").forEach((btn) => {
          btn.addEventListener("click", () =>
            cambiarEstado(p, btn.dataset.action),
          );
        });

        tbody.appendChild(tr);
      });
    }

    function renderBotones(p) {
      if (p.ESTADO === "A CONFIRMAR") {
        return `
      <button class="btn btn-outline-success"
              data-action="PREPARAR"
              title="Preparar">
        <i class="bi bi-box-seam"></i>
      </button>

      <button class="btn btn-outline-danger"
              data-action="RECHAZADO"
              title="Rechazar">
        <i class="bi bi-x-circle"></i>
      </button>
    `;
      }

      if (p.ESTADO === "PREPARAR") {
        return `
      <button class="btn btn-outline-warning"
              data-action="CONFIRMADO"
              title="Entregar">
        <i class="bi bi-truck"></i>
      </button>

      <button class="btn btn-outline-danger"
              data-action="RECHAZADO"
              title="Rechazar">
        <i class="bi bi-x-circle"></i>
      </button>
    `;
      }

      return `
    <button class="btn btn-outline-danger"
            data-action="ELIMINAR"
            title="Eliminar">
      <i class="bi bi-trash"></i>
    </button>
  `;
    }

    function colorEstado(estado) {
      switch (estado) {
        case "A CONFIRMAR":
          return "warning";
        case "PREPARAR":
          return "success";
        case "CONFIRMADO":
        case "ENTREGADO":
          return "primary";
        default:
          return "danger";
      }
    }

    async function cambiarEstado(p, accion) {
      console.log("Acción:", accion);

      if (accion?.trim().toUpperCase() === "PREPARAR") {
        console.log("Abriendo modal...");
        abrirModalPreparar(p);
        return;
      }
      if (accion === "CONFIRMADO" || accion === "ENTREGADO") {
        abrirModalEntrega(p);
        return;
      }

      if (accion === "ELIMINAR") {
        const confirm = await Swal.fire({
          icon: "warning",
          title: "Eliminar presupuesto?",
          showCancelButton: true,
        });

        if (!confirm.isConfirmed) return;

        await fetch(`/api/presupuestos/${p.PRESUPUESTO}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/presupuestos/gestion/cambiar-estado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presupuesto: p.PRESUPUESTO,
            nuevoEstado: accion,
            productos: p.PRODUCTOS,
          }),
        });
      }

      await cargar();
    }

    function mostrarProductos(p) {
      const div = container.querySelector("#productosDetalle");
      document.getElementById("productosModalLabel").textContent =
        `Listado de Productos del Presupuesto #${p.PRESUPUESTO}`;

      let htmlProductos = p.PRODUCTOS.map(
        (prod) => `
      <div class="border rounded p-2 mb-2 bg-light">
        <span class="badge ${
          prod.tipo === "ACCESORIOS" ? "bg-primary" : "bg-secondary"
        }">${prod.tipo}</span>
        <div class="fw-semibold mt-1">${prod.descripcion}</div>
        <small class="text-muted">
          ID: ${prod.id} | Cantidad: ${prod.cantidad}
        </small>
      </div>
    `,
      ).join("");

      let htmlEntrega = "";

      if (p.ESTADO === "PREPARAR" && p.DATOS_ADICIONALES) {
        const d = p.DATOS_ADICIONALES;
        document.getElementById("productosModalLabel").textContent =
          `Detalle del Presupuesto #${p.PRESUPUESTO}`;

        htmlEntrega = `
          <hr>
          <div class="border rounded p-3 bg-white shadow-sm">
            <h6 class="fw-bold mb-3 text-success">
              <i class="bi bi-clipboard-check me-2"></i>
              Datos de Entrega
            </h6>

            <div class="mb-1">
              <i class="bi bi-box me-2 text-muted"></i>
              <strong>Tipo:</strong> ${d.tipoEntrega || "-"}
            </div>

            <div class="mb-1">
              <i class="bi bi-calendar-event me-2 text-muted"></i>
              <strong>Fecha:</strong> ${d.fechaEntrega || "-"}
            </div>

            <div class="mb-1">
              <i class="bi bi-clock me-2 text-muted"></i>
              <strong>Hora:</strong> ${d.horaEntrega || "-"}
            </div>

            <div class="mb-1">
              <i class="bi bi-geo-alt me-2 text-muted"></i>
              <strong>Dirección:</strong> ${d.direccion || "-"}
            </div>

            <div class="mb-1">
              <i class="bi bi-link-45deg me-2 text-muted"></i>
              <strong>Ubicación:</strong>
              ${
                d.linkMaps
                  ? `<a href="${d.linkMaps}" target="_blank">Abrir en Google Maps</a>`
                  : "-"
              }
            </div>

            <div class="mt-2">
              <i class="bi bi-chat-left-text me-2 text-muted"></i>
              <strong>Observaciones:</strong>
              ${d.datosAdicionales || "-"}
            </div>
          </div>
        `;
      }

      div.innerHTML = htmlProductos + htmlEntrega;

      productosModal.show();
    }

    function renderTipoEntrega(p) {
      if (!p.DATOS_ADICIONALES) return "-";

      const datos = p.DATOS_ADICIONALES;
      if (!datos.tipoEntrega || !datos.fechaEntrega) return "-";

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const [year, month, day] = datos.fechaEntrega.split("-").map(Number);
      const fechaEntrega = new Date(year, month - 1, day); // 👈 LOCAL, no UTC
      fechaEntrega.setHours(0, 0, 0, 0);

      const diffTime = fechaEntrega - hoy;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // 🎨 Badge tipo
      let badgeTipo = "";
      if (datos.tipoEntrega === "ENVIO") {
        badgeTipo = `
      <span class="badge bg-info me-1">
        <i class="bi bi-truck me-1"></i>
        Envío
      </span>
    `;
      } else {
        badgeTipo = `
      <span class="badge bg-secondary me-1">
        <i class="bi bi-box-seam me-1"></i>
        Retira
      </span>
    `;
      }

      // 🎨 Badge fecha dinámica
      let badgeFecha = "";

      if (diffDays === 0) {
        badgeFecha = `
      <span class="badge bg-danger">
        <i class="bi bi-exclamation-circle me-1"></i>
        HOY
      </span>
    `;
      } else if (diffDays === 1) {
        badgeFecha = `
      <span class="badge bg-warning text-dark">
        <i class="bi bi-clock me-1"></i>
        MAÑANA
      </span>
    `;
      } else if (diffDays > 1) {
        badgeFecha = `
      <span class="badge bg-success">
        <i class="bi bi-calendar-check me-1"></i>
        Programado
      </span>
    `;
      } else {
        badgeFecha = `
      <span class="badge bg-dark">
        <i class="bi bi-x-circle me-1"></i>
        Vencido
      </span>
    `;
      }

      return badgeTipo + badgeFecha;
    }

    async function descargarPDF(numero) {
      try {
        const resp = await fetch(
          `/api/presupuestos/gestion/descargar-pdf/${numero}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!resp.ok) throw new Error("Error al descargar");

        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `PRESUPUESTO-${numero}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo descargar el PDF", "error");
      }
    }

    estadoBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        estadoBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        estadoActual = btn.dataset.estado;
        render();
      });
    });

    function abrirModalPreparar(p) {
      container.querySelector("#confirmarPreparar").disabled = true;

      prepararModal.show();

      setTimeout(() => {
        if (!map) {
          map = L.map("mapPreview").setView([-34.6037, -58.3816], 13);

          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
              attribution: "&copy; OpenStreetMap & CartoDB",
              subdomains: "abcd",
              maxZoom: 19,
            },
          ).addTo(map);
        }
      }, 300);

      container.querySelector("#confirmarPreparar").onclick =
        async function () {
          const tipo = container.querySelector("#tipoEntrega").value;
          const fechaEntrega = container.querySelector("#fechaEntrega").value;
          const horaEntrega = container.querySelector("#horaEntrega").value;
          const direccion = container.querySelector("#direccionEntrega").value;
          const linkMaps = container.querySelector("#linkMaps").value;
          const datosAdicionales =
            container.querySelector("#datosAdicionales").value;
          console.log("FECHA:", fechaEntrega);
          console.log("HORA:", horaEntrega);

          const resp = await fetch("/api/presupuestos/gestion/cambiar-estado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              presupuesto: p.PRESUPUESTO,
              nuevoEstado: "PREPARAR",
              productos: p.PRODUCTOS,
              tipoEntrega: tipo,
              fechaEntrega: fechaEntrega,
              horaEntrega: horaEntrega,
              direccion: tipo === "ENVIO" ? direccion : null,
              linkMaps: tipo === "ENVIO" ? linkMaps : null,
              datosAdicionales,
            }),
          });

          const data = await resp.json();

          if (!data.ok) {
            Swal.fire("Error", data.error || "No se pudo actualizar", "error");
            return;
          }

          prepararModal.hide();
          await cargar();
        };
    }

    function abrirModalEntrega(p) {
      const select = container.querySelector("#metodoPagoSelect");
      const btnConfirmar = container.querySelector("#confirmarEntrega");

      select.value = "";
      btnConfirmar.disabled = true;

      select.onchange = () => {
        btnConfirmar.disabled = !select.value;
      };

      btnConfirmar.onclick = async () => {
        const metodoPago = select.value;

        const resp = await fetch("/api/presupuestos/gestion/cambiar-estado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presupuesto: p.PRESUPUESTO,
            nuevoEstado: "CONFIRMADO",
            metodoPago,
          }),
        });

        const data = await resp.json();

        if (!data.ok) {
          Swal.fire("Error", data.error || "No se pudo entregar", "error");
          return;
        }

        entregarModal.hide();
        await cargar();
      };

      entregarModal.show();
    }

    const linkInput = container.querySelector("#linkMaps");
    const warning = container.querySelector("#direccionWarning");

    linkInput.oninput = debounce(async () => {
      const currentId = ++linkRequestId;

      const valor = linkInput.value.trim();
      coordsLink = null;

      linkInput.classList.remove("is-valid", "is-invalid");

      if (!valor) {
        validarFormulario();
        return;
      }

      let match = valor.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        coordsLink = {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
        };
        linkInput.classList.add("is-valid");
        actualizarMapaPrioritario();
        validarFormulario();
        return;
      }

      // Caso ?q=lat,lng directo
      match = valor.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        coordsLink = {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
        };
        linkInput.classList.add("is-valid");
        actualizarMapaPrioritario();
        validarFormulario();
        return;
      }

      if (valor.includes("google.com") || valor.includes("goo.gl")) {
        const resp = await fetch("/api/presupuestos/expandir-maps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: valor }),
        });

        const data = await resp.json();

        if (currentId !== linkRequestId) return;

        if (data.ok) {
          coordsLink = { lat: data.lat, lng: data.lng };
          linkInput.classList.add("is-valid");
          actualizarMapaPrioritario();
        } else {
          linkInput.classList.add("is-invalid");
        }

        validarFormulario();
      }
    }, 500);

    const direccionInput = container.querySelector("#direccionEntrega");

    direccionInput.oninput = debounce(async () => {
      const currentId = ++direccionRequestId;

      const direccion = direccionInput.value.trim();
      coordsDireccion = null;

      direccionInput.classList.remove("is-valid", "is-invalid");
      warning.classList.add("d-none");

      if (direccion.length < 5) {
        validarFormulario();
        return;
      }

      const resp = await fetch("/api/presupuestos/geocoding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion }),
      });

      const data = await resp.json();

      // 🔥 Si llegó una respuesta vieja la ignoramos
      if (currentId !== direccionRequestId) return;

      if (data.ok) {
        coordsDireccion = { lat: data.lat, lng: data.lng };
        direccionInput.classList.add("is-valid", "pe-5");
        actualizarMapaPrioritario();
      } else {
        direccionInput.classList.remove("is-valid", "pe-5");
        direccionInput.classList.add("is-invalid");
        warning.classList.remove("d-none");
      }

      validarFormulario();
    }, 700);

    function validarFormulario() {
      const fecha = container.querySelector("#fechaEntrega").value;
      const hora = container.querySelector("#horaEntrega").value;
      const tipo = container.querySelector("#tipoEntrega").value;

      let habilitar = fecha && hora;

      if (tipo === "ENVIO") {
        habilitar = habilitar && (coordsLink || coordsDireccion);
      }

      container.querySelector("#confirmarPreparar").disabled = !habilitar;
    }

    async function borrarRechazados() {
      const confirm = await Swal.fire({
        icon: "warning",
        title: "¿Eliminar todos los rechazados?",
        text: "Esta acción no se puede deshacer.",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Sí, eliminar todo",
      });

      if (!confirm.isConfirmed) return;

      try {
        const resp = await fetch("/api/presupuestos/borrar-rechazados", {
          method: "DELETE",
          credentials: "include",
        });

        if (!resp.ok) throw new Error("Error eliminando");

        await Swal.fire({
          icon: "success",
          title: "Eliminados correctamente",
        });

        await cargar(); // refrescar lista
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron eliminar", "error");
      }
    }

    function actualizarMapaPrioritario() {
      if (!map) return;

      if (coordsLink) {
        actualizarMapa(coordsLink.lat, coordsLink.lng);
      } else if (coordsDireccion) {
        actualizarMapa(coordsDireccion.lat, coordsDireccion.lng);
      }
    }

    function actualizarMapa(lat, lng) {
      if (!map) return;

      map.setView([lat, lng], 16);

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
    }

    container
      .querySelector("#prepararModal")
      .addEventListener("shown.bs.modal", () => {
        // Esperamos a que termine animación bootstrap
        setTimeout(() => {
          map = L.map("mapPreview", {
            zoomControl: true,
            attributionControl: false,
          }).setView([-34.6037, -58.3816], 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
          }).addTo(map);
        }, 300);
      });

    container
      .querySelector("#prepararModal")
      .addEventListener("hidden.bs.modal", resetModalPreparar);

    container
      .querySelector("#entregarModal")
      .addEventListener("hidden.bs.modal", () => {
        const select = container.querySelector("#metodoPagoSelect");
        const btnConfirmar = container.querySelector("#confirmarEntrega");
        select.value = "";
        btnConfirmar.disabled = true;
      });

    function debounce(fn, delay = 600) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
      };
    }

    function resetModalPreparar() {
      coordsDireccion = null;
      coordsLink = null;
      direccionRequestId = 0;
      linkRequestId = 0;

      const tipo = container.querySelector("#tipoEntrega");
      const fecha = container.querySelector("#fechaEntrega");
      const hora = container.querySelector("#horaEntrega");
      const direccion = container.querySelector("#direccionEntrega");
      const link = container.querySelector("#linkMaps");
      const warning = container.querySelector("#direccionWarning");
      const bloqueEnvio = container.querySelector("#bloqueEnvio");
      const btnConfirmar = container.querySelector("#confirmarPreparar");
      const datosAdicionales = container.querySelector("#datosAdicionales");

      // Reset valores
      tipo.value = "ENTREGA";
      fecha.value = "";
      hora.value = "";
      direccion.value = "";
      link.value = "";
      datosAdicionales.value = "";

      // Reset clases visuales
      direccion.classList.remove("is-valid", "is-invalid");
      link.classList.remove("is-valid", "is-invalid");

      warning.classList.add("d-none");
      bloqueEnvio.classList.add("d-none");

      btnConfirmar.disabled = true;

      // Reset mapa
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }

      if (map) {
        map.setView([-34.6037, -58.3816], 13);
      }
    }

    cargar();
  }
}
