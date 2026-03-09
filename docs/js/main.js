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
