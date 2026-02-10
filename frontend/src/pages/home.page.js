export function renderHome(container) {
  container.innerHTML = `
    <main class="container pb-5">

      <div class="mb-4 text-center text-white card-animate">
        <img src="/logo-aps.png" alt="Logo APS" width="240" class="mb-3"/>
        <h2 class="fw-bold">Panel principal</h2>
        <p class="opacity-75">Seleccione una acción para comenzar</p>
      </div>

      <div class="row g-4">
        <!-- PRESUPUESTOS -->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm card-action card-animate">
            <div class="card-body text-center">
              <div class="mb-3">
                <i class="bi bi-file-earmark-text fs-1 text-dark"></i>
              </div>
              <h5 class="card-title">Presupuestos</h5>
              <p class="card-text text-muted">
                Crear y administrar presupuestos
              </p>
              <button id="generateBudgetBtn" class="btn btn-aps w-100 mb-2">
                Generar
              </button>
              <button id="manageBudgetBtn" class="btn btn-aps w-100">Gestionar</button>
            </div>
          </div>
        </div>

        <!-- STOCK -->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm card-action card-animate">
            <div class="card-body text-center">
              <div class="mb-3">
                <i class="bi bi-box-seam fs-1 text-dark"></i>
              </div>
              <h5 class="card-title">Stock</h5>
              <p class="card-text text-muted">Gestión de productos</p>
              <button id="manageStockBtn" class="btn btn-aps w-100">Administrar</button>
            </div>
          </div>
        </div>

        <!-- CLIENTES -->
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm card-action card-animate">
            <div class="card-body text-center">
              <div class="mb-3">
                <i class="bi bi-people fs-1 text-dark"></i>
              </div>
              <h5 class="card-title">Clientes</h5>
              <p class="card-text text-muted">Alta y gestión de clientes</p>
              <button id="manageClientsBtn" class="btn btn-aps w-100">Administrar</button>
            </div>
          </div>
        </div>
      </div>
    </main>`;

  // ✨ Animación de entrada cards
  const cards = container.querySelectorAll(".card-animate");

  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("show");
    }, index * 600); // delay escalonado
  });

  const generateBudgetBtn = container.querySelector("#generateBudgetBtn");
  const manageBudgetBtn = container.querySelector("#manageBudgetBtn");
  const manageStockBtn = container.querySelector("#manageStockBtn");
  const manageClientsBtn = container.querySelector("#manageClientsBtn");

  generateBudgetBtn.addEventListener("click", () => {
    window.location.href = "/presupuestos/generate-budget";
  });

  manageBudgetBtn.addEventListener("click", () => {
    window.location.href = "/presupuestos/manage-budgets";
  });

  manageStockBtn.addEventListener("click", () => {
    window.location.href = "/stock/manage-stock";
  });

  manageClientsBtn.addEventListener("click", () => {
    window.location.href = "/clientes/manage-clients";
  });
}
