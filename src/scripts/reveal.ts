const READY_ATTR = "data-reveal-ready";
const REDUCED_ATTR = "data-reveal-reduced";
const STATE_ATTR = "data-reveal-state";
const globalScope =
  typeof window === "undefined"
    ? undefined
    : (window as Window & { __siteRevealBootstrapped?: boolean });

let observer: IntersectionObserver | null = null;
const REVEAL_SELECTOR = [
  "[data-reveal]",
  ".fade-in",
  ".slide-up",
  ".slide-in-left",
  ".stagger-children",
].join(", ");

function getStaggerDelay(index: number) {
  const step =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--site-reveal-stagger-step")
      .trim() || "80ms";

  return `calc(${step} * ${index})`;
}

function getRevealType(element: HTMLElement) {
  if (element.dataset.reveal) {
    return element.dataset.reveal;
  }

  if (element.classList.contains("stagger-children")) {
    return "stagger-children";
  }

  if (element.classList.contains("slide-in-left")) {
    return "slide-in-left";
  }

  if (element.classList.contains("slide-up")) {
    return "slide-up";
  }

  return "fade-in";
}

function reveal(element: HTMLElement) {
  element.setAttribute(STATE_ATTR, "revealed");
  observer?.unobserve(element);
}

function prepare(element: HTMLElement) {
  if (element.getAttribute(STATE_ATTR) === "revealed") {
    return;
  }

  element.setAttribute(STATE_ATTR, "pending");

  if (getRevealType(element) !== "stagger-children") {
    return;
  }

  Array.from(element.children).forEach((child, index) => {
    if (!(child instanceof HTMLElement)) {
      return;
    }

    child.style.setProperty(
      "--site-reveal-child-delay",
      getStaggerDelay(index),
    );
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initScrollReveal(root: ParentNode = document) {
  if (typeof window === "undefined" || !("querySelectorAll" in root)) {
    return;
  }

  observer?.disconnect();
  observer = null;

  const targets = Array.from(
    root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
  );

  if (!targets.length) {
    return;
  }

  // Reset state so elements are re-animated after View Transitions navigation
  targets.forEach((t) => t.removeAttribute(STATE_ATTR));

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    document.documentElement.setAttribute(READY_ATTR, "true");
    document.documentElement.setAttribute(REDUCED_ATTR, "true");
    targets.forEach(reveal);
    return;
  }

  document.documentElement.removeAttribute(REDUCED_ATTR);
  targets.forEach(prepare);
  document.documentElement.setAttribute(READY_ATTR, "true");

  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    },
  );

  targets.forEach((target) => {
    if (target.getAttribute(STATE_ATTR) === "revealed") {
      return;
    }

    observer?.observe(target);
  });

  // View Transitions may prevent IntersectionObserver from firing while
  // the transition animation is active. Re-check after it typically completes.
  setTimeout(() => {
    targets.forEach((target) => {
      if (target.getAttribute(STATE_ATTR) !== "pending") return;
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(target);
      }
    });
  }, 300);
}

function boot() {
  initScrollReveal();
}

if (typeof document !== "undefined") {
  if (!globalScope?.__siteRevealBootstrapped) {
    if (globalScope) {
      globalScope.__siteRevealBootstrapped = true;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      boot();
    }

    document.addEventListener("astro:page-load", boot);
  }
}
