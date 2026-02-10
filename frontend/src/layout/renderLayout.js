import { renderNavbar } from "../components/navbar.js";

export function renderLayout(container, renderPageFn) {
  if (!container) {
    throw new Error("renderLayout: container es null");
  }

  container.innerHTML = `
    <div id="navbarContainer"></div>
    <div id="pageContent"></div>
  `;

  const navbarContainer = document.getElementById("navbarContainer");
  const pageContent = document.getElementById("pageContent");

  renderNavbar(navbarContainer);
  renderPageFn(pageContent);
}
