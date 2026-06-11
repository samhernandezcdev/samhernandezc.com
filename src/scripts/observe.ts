/**
 * Lightweight reveal-on-scroll using IntersectionObserver.
 * Elements with [data-reveal] animate when they enter the viewport.
 */
function initReveal() {
  if (typeof document === "undefined") return;

  const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!elements.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

// Run on initial load and after View Transitions
if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", initReveal);
  initReveal();
}
