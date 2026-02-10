export function animateFadeUp(container, selector = ".fade-up", delay = 120) {
  const elements = container.querySelectorAll(selector);

  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("show");
    }, index * delay);
  });
}
