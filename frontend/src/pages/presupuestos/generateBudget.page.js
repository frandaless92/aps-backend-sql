// src/pages/presupuestos/generateBudget.page.js
import * as bootstrap from "bootstrap";
import { animateFadeUp } from "../../utils/animate";

export function renderGenerateBudget(container) {
  container.innerHTML = `
    <main class="container-fluid py-5">
      <div class="row g-4">

        <!-- =========================
            COLUMNA IZQUIERDA
        ========================== -->
        <div class="col-12 col-lg-4">

          <!-- CLIENTE -->
          <div class="card mb-4 shadow-sm fade-up">
            <div class="card-body">
              <small class="text-muted">Cliente</small>
              <h5 class="fw-bold mt-1" id="clienteSeleccionado">
                Seleccionar cliente
              </h5>
              <h6 class="fw-bold mt-1" id="clienteInfo1">
              </h6>
              <h6 class="fw-bold mt-1" id="clienteInfo2">
              </h6>

              <button id="btnCambiarCliente" class="btn btn-outline-primary btn-sm mt-3 w-100">
                Cambiar cliente
              </button>
            </div>
          </div>

          <!-- DATOS DEL PRESUPUESTO -->
          <div class="card shadow-sm fade-up">
            <div class="card-body">
              <h6 class="fw-bold mb-3">Datos del presupuesto</h6>

              <!-- CONDICIÓN DE PAGO -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Condición de pago</label>
                <div class="btn-group w-100" id="condicionPagoGroup">
                  <button class="btn btn-outline-primary active" data-value="Contado">Contado</button>
                  <button class="btn btn-outline-primary" data-value="Débito">Débito</button>
                  <button class="btn btn-outline-primary" data-value="Crédito">Crédito</button>
                </div>
              </div>

              <!-- MANO DE OBRA -->
              <div class="mb-3">
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" id="chkManoObra">
                  <label class="form-check-label fw-semibold">
                    Incluir mano de obra
                  </label>
                </div>

                <input
                  id="inputManoObra"
                  type="number"
                  class="form-control d-none"
                  placeholder="Importe de mano de obra"
                />
              </div>

              <!-- TRABAJO -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Trabajo</label>
                <input id="inputTrabajo" class="form-control" placeholder="Nombre de quien trabajó" />
              </div>

              <!-- VENDEDOR -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Vendedor</label>
                <input id="inputVendedor" class="form-control" placeholder="Nombre del vendedor" />
              </div>

              <!-- VALIDEZ -->
              <div>
                <label class="form-label fw-semibold">Validez</label>
                <input id="inputValidez" type="date" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- =========================
            COLUMNA DERECHA
        ========================== -->
        <div class="col-12 col-lg-8">

          <!-- PRODUCTOS -->
          <div class="card shadow-sm mb-4 fade-up">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0">Productos</h6>
                <button class="btn btn-primary btn-sm">
                  Agregar producto
                </button>
              </div>

              <!-- LISTA / TABLA -->
              <div class="table-responsive">
                <table class="table align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Producto</th>
                      <th class="text-center">Cant.</th>
                      <th class="text-end">Precio</th>
                      <th class="text-end">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- RESUMEN TOTAL -->
          <div class="card shadow-sm fade-up">
            <div class="card-body">

              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal productos</span>
              </div>

              <div class="d-flex justify-content-between mb-2">
                <span>Mano de obra</span>
              </div>

              <hr />

              <div class="d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">TOTAL</h5>
                <h4 class="fw-bold text-success mb-0"></h4>
              </div>

              <button id="btnGenerarPresupuesto" class="btn btn-success w-100 mt-4">
                GENERAR PRESUPUESTO (PDF)
              </button>
            </div>
          </div>

        </div>
      </div>
      <!-- =========================
     MODAL CLIENTES
      ========================== -->
      <div
        class="modal fade"
        id="clientesModal"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title fw-bold">Seleccionar cliente</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <!-- BUSCADOR -->
              <input
                id="clienteSearch"
                type="text"
                class="form-control mb-3"
                placeholder="Buscar cliente por nombre o apellido..."
              />

              <!-- LISTA -->
              <div id="clientesList" class="list-group">
                <!-- clientes dinámicos -->
              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </div>
    <div class="modal fade" id="productosModal" tabindex="-1">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title fw-bold">Seleccionar producto</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">

        <!-- FILTROS -->
        <div class="row g-3 mb-3">

          <!-- PRECIO -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Tipo de precio</label>
            <div class="btn-group w-100" id="precioGroup">
              <button class="btn btn-outline-primary active" data-value="contado">
                Contado
              </button>
              <button class="btn btn-outline-primary" data-value="lista">
                Lista
              </button>
            </div>
          </div>

          <!-- CATEGORIA -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Categoría</label>
            <div class="btn-group w-100" id="categoriaGroup">
              <button class="btn btn-outline-secondary active" data-value="Accesorios">
                Accesorios
              </button>
              <button class="btn btn-outline-secondary" data-value="Tejidos">
                Tejidos
              </button>
            </div>
          </div>
        </div>

        <!-- LISTA -->
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-center">Stock</th>
                <th class="text-end">Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="productosList"></tbody>
          </table>
        </div>

      </div>

    </div>
  </div>
</div>
    <div class="modal fade" id="cantidadModal" tabindex="-1">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title fw-bold">Cantidad</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body text-center">
        <input
          id="inputCantidadProducto"
          type="number"
          step="0.1"
          min="0.1"
          class="form-control text-center fs-5"
        />
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">
          Cancelar
        </button>
        <button id="btnConfirmarCantidad" class="btn btn-success">
          Agregar
        </button>
      </div>

    </div>
  </div>
</div>


    </main>

  `;

  animateFadeUp(container);

  let productoSeleccionado = null;

  const cantidadModal = new bootstrap.Modal(
    document.getElementById("cantidadModal"),
  );

  const inputCantidadProducto = container.querySelector(
    "#inputCantidadProducto",
  );

  const presupuesto = {
    cliente: null,
    items: [],
    total: 0,

    condicionPago: "Contado",
    referenciaPago: "",

    trabajo: "",
    vendedor: "",
    validez: "",

    incluyeManoObra: false,
    manoObra: 0,
  };

  function formatearFechaAR(fechaISO) {
    if (!fechaISO) return "";

    const [year, month, day] = fechaISO.split("-");
    return `${day}/${month}/${year}`;
  }

  const tbodyPresupuesto = container.querySelector(".card table tbody");

  const resumenSubtotalProductos = container.querySelector(".card-body span");

  const resumenManoObra = container.querySelectorAll(".card-body span")[1];

  const resumenTotal = container.querySelector(".text-success");

  function validarPresupuesto() {
    if (!presupuesto.cliente) {
      Swal.fire("Atención", "Debe seleccionar un cliente", "warning");
      return false;
    }

    if (!presupuesto.items.length) {
      Swal.fire("Atención", "Debe agregar al menos un producto", "warning");
      return false;
    }

    for (const item of presupuesto.items) {
      if (!item.cantidad || item.cantidad <= 0) {
        Swal.fire(
          "Atención",
          `Cantidad inválida para el producto "${item.nombre}"`,
          "warning",
        );
        return false;
      }
    }

    if (!presupuesto.vendedor) {
      Swal.fire("Atención", "Debe ingresar el vendedor", "warning");
      return false;
    }

    if (presupuesto.incluyeManoObra && presupuesto.manoObra <= 0) {
      Swal.fire(
        "Atención",
        "Debe ingresar un importe válido de mano de obra",
        "warning",
      );
      return false;
    }

    if (!presupuesto.total || presupuesto.total <= 0) {
      Swal.fire("Atención", "El total del presupuesto no es válido", "warning");
      return false;
    }

    return true;
  }

  function recalcularResumen() {
    const subtotalProductos = presupuesto.items.reduce(
      (acc, item) => acc + item.subtotal,
      0,
    );

    const manoObra = presupuesto.incluyeManoObra ? presupuesto.manoObra : 0;

    presupuesto.total = subtotalProductos + manoObra;

    resumenSubtotalProductos.textContent = `Subtotal productos: $ ${subtotalProductos.toLocaleString()}`;

    resumenManoObra.textContent = `Mano de obra: $ ${manoObra.toLocaleString()}`;

    resumenTotal.textContent = `$ ${presupuesto.total.toLocaleString()}`;
  }

  function renderTablaPresupuesto() {
    tbodyPresupuesto.innerHTML = "";

    presupuesto.items.forEach((item) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${item.nombre}</td>
      <td class="text-center">${item.cantidad}</td>
      <td class="text-end">
        $ ${Number(item.precio || 0).toLocaleString("es-AR")}
      </td>
      <td class="text-end">$ ${item.subtotal.toLocaleString()}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger">✕</button>
      </td>
    `;

      // 🔹 eliminar producto
      tr.querySelector("button").addEventListener("click", () => {
        presupuesto.items = presupuesto.items.filter((p) => p.id !== item.id);
        renderTablaPresupuesto();
        recalcularResumen();
      });

      tbodyPresupuesto.appendChild(tr);
    });
  }

  function agregarProductoConCantidad(producto, cantidad) {
    const existente = presupuesto.items.find((item) => item.id === producto.id);

    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.cantidad * existente.precio;
    } else {
      presupuesto.items.push({
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria, // 👈 clave
        precio: producto.precio,
        cantidad,
        subtotal: cantidad * producto.precio,
      });
    }

    renderTablaPresupuesto();
    recalcularResumen();
  }

  // ====== CONDICION PAGO ======
  container.querySelectorAll(".condPago").forEach((btn) => {
    btn.addEventListener("click", () => {
      condicionPago = btn.dataset.value;
    });
  });

  // ====== REFERENCIA PAGO ======
  container.querySelectorAll(".refPago").forEach((btn) => {
    btn.addEventListener("click", () => {
      referenciaPago = btn.dataset.value;
    });
  });

  const clientesModal = new bootstrap.Modal(
    document.getElementById("clientesModal"),
  );

  container
    .querySelector("#btnCambiarCliente")
    .addEventListener("click", cargarClientes);

  async function cargarClientes() {
    Swal.fire({
      title: "Cargando clientes...",
      text: "Por favor espere",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const resp = await fetch("/api/clientes");
      if (!resp.ok) throw new Error("Error al cargar clientes");

      const clientes = await resp.json();
      renderClientes(clientes);

      Swal.close();
      clientesModal.show();
    } catch (err) {
      Swal.close();
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los clientes",
      });
    }
  }

  function renderClientes(clientes) {
    const list = container.querySelector("#clientesList");
    list.innerHTML = "";

    clientes.forEach((cliente) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-group-item list-group-item-action";

      item.innerHTML = `
      <div class="fw-bold">${cliente.apellido}, ${cliente.nombre}</div>
      <small class="text-muted">
        ${cliente.telefono || ""} ${cliente.email || ""}
      </small>
    `;

      item.addEventListener("click", () => seleccionarCliente(cliente));
      list.appendChild(item);
    });
  }

  function seleccionarCliente(cliente) {
    presupuesto.cliente = cliente;

    container.querySelector("#clienteSeleccionado").textContent =
      `${cliente.apellido}, ${cliente.nombre}`;

    container.querySelector("#clienteInfo1").textContent =
      `Teléfono: ${cliente.telefono || "No disponible"}`;

    container.querySelector("#clienteInfo2").textContent =
      `CUIT: ${cliente.cuit || "No disponible"}`;

    clientesModal.hide();
  }

  container
    .querySelector("#clienteSearch")
    .addEventListener("input", function () {
      const filtro = this.value.toLowerCase();
      const items = container.querySelectorAll(
        "#clientesList .list-group-item",
      );

      items.forEach((item) => {
        item.style.display = item.textContent.toLowerCase().includes(filtro)
          ? ""
          : "none";
      });
    });

  function validarCliente() {
    if (!presupuesto.cliente) {
      alert("Debe seleccionar un cliente");
      return false;
    }
    return true;
  }

  const condBtns = container.querySelectorAll("#condicionPagoGroup button");

  condBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      condBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      presupuesto.condicionPago = btn.dataset.value;
      console.log("📦 condicionPago:", presupuesto.condicionPago);
    });
  });

  const inputTrabajo = container.querySelector("#inputTrabajo");

  inputTrabajo.addEventListener("input", () => {
    presupuesto.trabajo = inputTrabajo.value.trim();
  });

  const inputVendedor = container.querySelector("#inputVendedor");

  inputVendedor.addEventListener("input", () => {
    presupuesto.vendedor = inputVendedor.value.trim();
  });

  const inputValidez = container.querySelector("#inputValidez");

  inputValidez.addEventListener("change", () => {
    presupuesto.validez = inputValidez.value;
    console.log("📦 validez:", presupuesto.validez);
  });

  const chkManoObra = container.querySelector("#chkManoObra");
  const inputManoObra = container.querySelector("#inputManoObra");

  chkManoObra.addEventListener("change", () => {
    presupuesto.incluyeManoObra = chkManoObra.checked;
    inputManoObra.classList.toggle("d-none", !chkManoObra.checked);

    if (!chkManoObra.checked) {
      presupuesto.manoObra = 0;
      inputManoObra.value = "";
    }
  });

  inputManoObra.addEventListener("input", () => {
    presupuesto.manoObra = Number(inputManoObra.value) || 0;
    recalcularResumen();
  });

  let filtroPrecio = "contado";
  let filtroCategoria = "Accesorios";

  async function cargarProductos() {
    try {
      const resp = await fetch("/api/productos");
      if (!resp.ok) throw new Error("Error cargando productos");

      let productos = await resp.json();

      // 🔹 filtrar categoría
      productos = productos.filter((p) => p.categoria === filtroCategoria);

      // 🔹 adaptar estructura + precio
      productos = productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        stock: Number(p.stock),
        precio:
          filtroPrecio === "lista" ? Number(p.precio_lista) : Number(p.precio),
      }));

      renderProductos(productos);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    }
  }

  function renderProductos(productos) {
    const tbody = container.querySelector("#productosList");
    tbody.innerHTML = "";

    productos.forEach((p) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${p.nombre}</td>
      <td class="text-center">${p.stock}</td>
      <td class="text-end">$ ${Number(p.precio || 0).toLocaleString("es-AR")}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-success">Agregar</button>
      </td>
    `;

      tr.querySelector("button").addEventListener("click", () => {
        productoSeleccionado = p;
        inputCantidadProducto.value = "";
        cantidadModal.show();
      });

      tbody.appendChild(tr);
    });
  }

  container
    .querySelector("#btnConfirmarCantidad")
    .addEventListener("click", () => {
      const cant = Number(inputCantidadProducto.value.replace(",", "."));

      if (isNaN(cant) || cant <= 0) {
        Swal.fire(
          "Cantidad inválida",
          "Ingrese una cantidad válida",
          "warning",
        );
        return;
      }

      agregarProductoConCantidad(productoSeleccionado, cant);
      cantidadModal.hide();
    });

  function setupToggle(groupId, callback) {
    const buttons = container.querySelectorAll(`#${groupId} button`);

    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        callback(btn.dataset.value);

        Swal.fire({
          title: "Actualizando tabla...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          await cargarProductos();
        } finally {
          Swal.close();
        }
      });
    });
  }

  setupToggle("precioGroup", (val) => (filtroPrecio = val));
  setupToggle("categoriaGroup", (val) => (filtroCategoria = val));

  const productosModal = new bootstrap.Modal(
    document.getElementById("productosModal"),
  );

  container
    .querySelector("button.btn-primary.btn-sm")
    .addEventListener("click", () => {
      cargarProductos();
      productosModal.show();
    });

  container
    .querySelector("#btnGenerarPresupuesto")
    .addEventListener("click", async () => {
      if (!validarPresupuesto()) return;

      let itemsFinales = [...presupuesto.items];

      // 👉 Mano de obra como ítem de servicio
      if (presupuesto.incluyeManoObra) {
        const valorManoObra = Number(presupuesto.manoObra);

        if (isNaN(valorManoObra) || valorManoObra <= 0) {
          Swal.fire(
            "Atención",
            "El valor de mano de obra no es válido",
            "warning",
          );
          return;
        }

        itemsFinales.push({
          id: "MANO_OBRA",
          nombre: "MANO DE OBRA",
          categoria: "SERVICIO",
          precio: valorManoObra,
          cantidad: 1,
          subtotal: valorManoObra,
        });
      }

      const payload = {
        cliente: presupuesto.cliente,
        items: itemsFinales,
        total: presupuesto.total,
        condicionPago: presupuesto.condicionPago,
        referenciaPago: presupuesto.referenciaPago,
        trabajo: presupuesto.trabajo,
        vendedor: presupuesto.vendedor,
        validez: formatearFechaAR(presupuesto.validez),
      };

      try {
        // ⏳ Loader
        Swal.fire({
          title: "Generando presupuesto...",
          text: "Por favor espere",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const resp = await fetch("/api/presupuestos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          throw new Error("Error generando el presupuesto");
        }

        const presupuestoNumero = resp.headers.get("X-Presupuesto-Numero");

        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);

        // 📄 descarga automática
        const a = document.createElement("a");
        a.href = url;
        a.download = `PRESUPUESTO-${presupuestoNumero || "PDF"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: "success",
          title: "Presupuesto generado",
          text: `Presupuesto N° ${presupuestoNumero} generado correctamente`,
        }).then(() => {
          resetPresupuesto();
        });
      } catch (err) {
        console.error(err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo generar el presupuesto",
        });
      }
    });

  function resetPresupuesto() {
    // 🧠 Estado
    presupuesto.cliente = null;
    presupuesto.items = [];
    presupuesto.total = 0;

    presupuesto.trabajo = "";
    presupuesto.vendedor = "";
    presupuesto.validez = "";
    presupuesto.condicionPago = "Contado";
    presupuesto.referenciaPago = "";

    presupuesto.incluyeManoObra = false;
    presupuesto.manoObra = 0;

    // 🧾 UI cliente
    container.querySelector("#clienteSeleccionado").textContent =
      "Seleccionar cliente";
    container.querySelector("#clienteInfo1").textContent = "";
    container.querySelector("#clienteInfo2").textContent = "";

    // 🛠️ Mano de obra
    chkManoObra.checked = false;
    inputManoObra.classList.add("d-none");
    inputManoObra.value = "";

    // ✏️ Inputs
    container.querySelector("#inputTrabajo").value = "";
    container.querySelector("#inputVendedor").value = "";
    container.querySelector("#inputValidez").value = "";

    // 💳 Condición de pago (visual)
    condBtns.forEach((b) => b.classList.remove("active"));
    condBtns[0].classList.add("active");

    // 🧾 Tabla
    renderTablaPresupuesto();

    // 💰 Resumen
    recalcularResumen();
  }
}
