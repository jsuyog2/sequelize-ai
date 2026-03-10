const html = document.documentElement;
const toggle = document.getElementById("theme-toggle");
const thumb = document.getElementById("toggle-thumb");

function applyTheme(mode) {
  const isDark = mode === "dark";
  html.classList.toggle("dark", isDark);

  if (thumb) {
    thumb.textContent = isDark ? "🌙" : "☀️";
    thumb.style.transform = isDark ? "translateX(0)" : "translateX(22px)";
  }
  if (toggle) toggle.style.background = isDark ? "#4f46e5" : "#06b6d4";

  localStorage.setItem("theme", mode);
}

const stored = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(stored ?? (prefersDark ? "dark" : "light"));

toggle?.addEventListener("click", () => {
  const isDark = html.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
});

const mobileBtn = document.getElementById("mobile-menu-btn");
const mobileNav = document.getElementById("mobile-nav");
mobileBtn?.addEventListener("click", () =>
  mobileNav.classList.toggle("hidden"),
);
document.querySelectorAll("#mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => mobileNav.classList.add("hidden"));
});

const navbar = document.getElementById("navbar");
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 40) {
      const isDark = html.classList.contains("dark");
      navbar.style.background = isDark
        ? "rgba(5, 5, 15, 0.85)"
        : "rgba(255, 255, 255, 0.9)";
      navbar.style.borderBottom = isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.06)";
      navbar.style.boxShadow = isDark
        ? "0 4px 30px rgba(0,0,0,0.4)"
        : "0 4px 20px rgba(0,0,0,0.05)";
    } else {
      navbar.style.background = "transparent";
      navbar.style.borderBottom = "none";
      navbar.style.boxShadow = "none";
    }
  },
  { passive: true },
);

document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const url = new URL(this.href, window.location.origin);
    if (
      url.pathname === window.location.pathname ||
      (url.pathname === "/" &&
        window.location.pathname.endsWith("index.html")) ||
      (window.location.pathname === "/" && url.pathname.endsWith("index.html"))
    ) {
      const targetId = url.hash.substring(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
        history.pushState(null, null, url.hash);
      }
    }
  });
});

function initGSAP() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    setTimeout(initGSAP, 100);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (document.getElementById("hero-badge")) {
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from("#hero-badge", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        clearProps: "all",
      })
      .from(
        "#hero-title",
        { y: 40, opacity: 0, duration: 0.7, clearProps: "all" },
        "-=0.3",
      )
      .from(
        "#hero-sub",
        { y: 30, opacity: 0, duration: 0.6, clearProps: "all" },
        "-=0.4",
      )
      .from(
        "#hero-ctas",
        { y: 25, opacity: 0, duration: 0.6, clearProps: "all" },
        "-=0.35",
      )
      .from(
        "#hero-code",
        { y: 30, opacity: 0, scale: 0.97, duration: 0.7, clearProps: "all" },
        "-=0.3",
      );
  }

  const docsContainer = document.getElementById("docs-content");
  if (docsContainer) {
    const children = Array.from(docsContainer.children);
    children.forEach((c) => c.classList.add("gsap-hidden"));
    gsap.from(children, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
      clearProps: "all",
    });
  }

  gsap.from("#navbar", {
    y: -60,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
    clearProps: "all",
  });

  [".section-badge", ".section-title", ".section-sub"].forEach(
    (selector, i) => {
      gsap.utils.toArray(selector).forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 88%" },
          y: 25,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          clearProps: "all",
        });
      });
    },
  );

  gsap.from(".feature-card", {
    scrollTrigger: { trigger: ".feature-card", start: "top 85%" },
    y: 40,
    opacity: 0,
    scale: 0.96,
    duration: 0.6,
    stagger: 0.1,
    ease: "power3.out",
    clearProps: "all",
  });
  gsap.from(".step-card", {
    scrollTrigger: { trigger: ".step-card", start: "top 85%" },
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "power3.out",
    clearProps: "all",
  });
  gsap.from(".cta-box", {
    scrollTrigger: { trigger: ".cta-box", start: "top 85%" },
    y: 40,
    opacity: 0,
    scale: 0.96,
    duration: 0.8,
    ease: "power3.out",
    clearProps: "all",
  });
}
window.addEventListener("load", initGSAP);

document.querySelectorAll(".feature-card, .step-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.transform = `perspective(800px) rotateY(${mx}deg) rotateX(${my}deg) translateY(-6px)`;
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));
});

// Initialize Lucide Icons
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

// Code block copy buttons
document.querySelectorAll("pre").forEach((block) => {
  // Only add copy button if the pre contains a code block
  if (!block.querySelector("code")) return;

  block.classList.add("relative", "group");

  const button = document.createElement("button");
  button.className =
    "absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10";
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
  button.title = "Copy to clipboard";

  button.addEventListener("click", async () => {
    const text = block.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        button.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  });

  block.appendChild(button);
});

// Search Filtering
const searchInput = document.getElementById("doc-search");
if (searchInput) {
  // Listen for Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", (e) => {
    const filter = e.target.value.toLowerCase();
    const content = document.getElementById("docs-content");
    if (!content) return;

    // Simple logic highlighting: iterate all h2s and ps, and hide unmatching paragraphs
    // A robust search would need a separate index, but for single-page docs this acts as a filter
    const nodes = content.querySelectorAll("h2, h3, p, pre");
    nodes.forEach((node) => {
      if (filter === "") {
        node.style.display = "";
        return;
      }

      const text = node.textContent.toLowerCase();
      if (text.includes(filter)) {
        node.style.display = "";
        // Unhide the closest preceding H2 if matched a P/PRE
        if (node.tagName !== "H2" && node.tagName !== "H3") {
          let prev = node.previousElementSibling;
          while (prev && prev.tagName !== "H2") {
            if (prev.tagName === "H3") prev.style.display = "";
            prev = prev.previousElementSibling;
          }
          if (prev) prev.style.display = "";
        }
      } else {
        node.style.display = "none";
      }
    });
  });
}
