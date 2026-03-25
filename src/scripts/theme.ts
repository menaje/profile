type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* SSR or private browsing */
  }
  return "system";
}

function getResolvedTheme(preference: Theme): "light" | "dark" {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

function applyTheme(preference: Theme) {
  const resolved = getResolvedTheme(preference);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;

  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    /* quota exceeded or private browsing */
  }

  // Sync toggle UI state
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((btn) => {
      const isActive = btn.dataset.themeToggle === preference;
      btn.setAttribute("aria-pressed", String(isActive));
    });
}

function initTheme() {
  const preference = getStoredTheme();
  applyTheme(preference);

  // Listen for OS preference changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    });

  // Delegate click on toggle buttons
  document.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>(
      "[data-theme-toggle]",
    );
    if (btn?.dataset.themeToggle) {
      applyTheme(btn.dataset.themeToggle as Theme);
    }
  });
}

initTheme();

// Persist theme across Astro View Transitions
document.addEventListener("astro:after-swap", () => {
  const preference = getStoredTheme();
  applyTheme(preference);
});
