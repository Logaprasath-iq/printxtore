// Theme and RTL Engine for PRINTXTORE
// Immediately invoked to prevent layout jumps

(function() {
  const currentTheme = localStorage.getItem("px_theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (currentTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  const currentRtl = localStorage.getItem("px_rtl") === "true";
  document.documentElement.setAttribute("dir", currentRtl ? "rtl" : "ltr");
})();

document.addEventListener("DOMContentLoaded", () => {
  // Bind theme selectors
  const themeToggles = document.querySelectorAll(".theme-toggle");
  themeToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      let nowTheme = document.documentElement.getAttribute("data-theme");
      let nextTheme = nowTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("px_theme", nextTheme);
      
      // Dispatch custom event for charts or components that react to dark mode
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: nextTheme } }));
    });
  });

  // Bind RTL toggles
  const rtlToggles = document.querySelectorAll(".rtl-toggle");
  const isRtlInitial = document.documentElement.getAttribute("dir") === "rtl";
  rtlToggles.forEach(toggle => {
    const span = toggle.querySelector("span");
    if (span) {
      span.textContent = isRtlInitial ? "LTR" : "RTL";
    }
    toggle.addEventListener("click", () => {
      let isRtl = document.documentElement.getAttribute("dir") === "rtl";
      let nextRtl = !isRtl;
      
      document.documentElement.setAttribute("dir", nextRtl ? "rtl" : "ltr");
      localStorage.setItem("px_rtl", nextRtl ? "true" : "false");
      
      // Update text on all toggle buttons
      document.querySelectorAll(".rtl-toggle span").forEach(s => {
        s.textContent = nextRtl ? "LTR" : "RTL";
      });
      
      // Relocate toast, trigger layout update
      window.dispatchEvent(new CustomEvent("rtlchange", { detail: { rtl: nextRtl } }));
    });
  });
});
