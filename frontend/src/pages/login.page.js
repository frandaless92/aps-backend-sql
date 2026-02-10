export function renderLogin(container) {
  container.innerHTML = `<div class="container vh-100">
      <div class="row h-100 justify-content-center align-items-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h4 class="text-center mb-4">Acceso al Sistema</h4>

              <form id="loginForm" novalidate>
                <div class="mb-3">
                  <label for="username" class="form-label">Usuario</label>
                  <input
                    type="text"
                    id="username"
                    class="form-control"
                    autocomplete="username"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    autocomplete="current-password"
                    required
                  />
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" id="btnLogin">
                    Ingresar
                  </button>
                </div>
              </form>

              <div id="loginMsg" class="text-center mt-3 small"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  const btn = document.getElementById("btnLogin");

  // seguridad defensiva: si el HTML no está completo, no inicializa
  if (!form || !msg || !btn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "";
    msg.className = "text-center mt-3 small";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      msg.textContent = "Complete todos los campos";
      msg.classList.add("text-danger");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Verificando...";

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        msg.textContent = data.message || "Credenciales inválidas";
        msg.classList.add("text-danger");
        return;
      }

      msg.textContent = data.message || "Login OK";
      msg.classList.add("text-success");

      setTimeout(() => {
        window.location.href = "/home";
      }, 800);
    } catch (err) {
      msg.textContent = "Error de conexión con el servidor";
      msg.classList.add("text-danger");
    } finally {
      btn.disabled = false;
      btn.textContent = "Ingresar";
    }
  });
}
