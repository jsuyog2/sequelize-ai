// build-docs.js
const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "docs");
const CSS_DIR = path.join(DOCS_DIR, "css");
const JS_DIR = path.join(DOCS_DIR, "js");

// 1. Clean and Setup Directories
if (fs.existsSync(DOCS_DIR))
  fs.rmSync(DOCS_DIR, { recursive: true, force: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });
fs.mkdirSync(CSS_DIR, { recursive: true });
fs.mkdirSync(JS_DIR, { recursive: true });

// 2. Define Assets
const styleCss = `
body {
  background-color: #050510;
  color: #f8fafc;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 99px; }

/* Themes */
html.dark { color-scheme: dark; }

.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 50%, #a855f7 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-x 5s ease infinite;
}

@keyframes gradient-x {
  0%, 100% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
}

.glow-primary {
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.35), 0 0 80px rgba(99, 102, 241, 0.12);
}

.card-hover {
  transition: transform 0.3s cubic-bezier(.25,.8,.25,1), box-shadow 0.3s cubic-bezier(.25,.8,.25,1), border-color 0.3s;
}
.card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(99,102,241,0.18);
}

.hero-bg {
  background-color: #05050f;
  background-image:
    radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,102,241,0.20) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(34,211,238,0.12) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(168,85,247,0.06) 0%, transparent 70%);
}
html:not(.dark) .hero-bg {
  background-color: #f8faff;
  background-image:
    radial-gradient(ellipse 80% 60% at 20% -10%, rgba(99,102,241,0.10) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(34,211,238,0.08) 0%, transparent 70%);
}

.blob {
  border-radius: 9999px;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
  position: absolute;
}

.code-block {
  background: rgba(15,15,35,0.85);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.7;
}

html:not(.dark) .code-block {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.nav-blur {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.glass-card {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
}
html:not(.dark) .glass-card {
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

/* Typography and code blocks */
code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}
html.dark code {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
pre {
  background: #0f172a !important;
  color: #f8fafc !important;
  border: 1px solid #1e293b;
  border-radius: 0.75rem !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
  padding: 1.25rem;
  overflow-x: auto;
}
html.dark pre {
  border-color: rgba(255,255,255,0.1);
}
pre code {
  background: transparent !important;
  color: inherit !important;
  padding: 0;
  font-size: 0.9em;
}

.toggle-track {
  width: 48px; height: 26px;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}
.toggle-thumb {
  width: 20px; height: 20px;
  border-radius: 50%;
  position: absolute;
  top: 3px; left: 3px;
  transition: transform 0.3s cubic-bezier(.4,0,.2,1), background 0.3s;
}

.gsap-hidden { opacity: 1; }
`;

const mainJs = `
const html = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const thumb = document.getElementById('toggle-thumb');

function applyTheme(mode) {
  const isDark = mode === 'dark';
  html.classList.toggle('dark', isDark);

  if (thumb) {
    thumb.textContent = isDark ? '🌙' : '☀️';
    thumb.style.transform = isDark ? 'translateX(0)' : 'translateX(22px)';
  }
  if (toggle) toggle.style.background = isDark ? '#4f46e5' : '#06b6d4';
  
  localStorage.setItem('theme', mode);
}

const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(stored ?? (prefersDark ? 'dark' : 'light'));

toggle?.addEventListener('click', () => {
  const isDark = html.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark');
});

const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
mobileBtn?.addEventListener('click', () => mobileNav.classList.toggle('hidden'));
document.querySelectorAll('#mobile-nav a').forEach(link => {
  link.addEventListener('click', () => mobileNav.classList.add('hidden'));
});

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    const isDark = html.classList.contains('dark');
    navbar.style.background = isDark ? 'rgba(5, 5, 15, 0.85)' : 'rgba(255, 255, 255, 0.9)';
    navbar.style.borderBottom = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)';
    navbar.style.boxShadow = isDark ? '0 4px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)';
  } else {
    navbar.style.background = 'transparent';
    navbar.style.borderBottom = 'none';
    navbar.style.boxShadow = 'none';
  }
}, { passive: true });

document.querySelectorAll('a[href*="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const url = new URL(this.href, window.location.origin);
    if (url.pathname === window.location.pathname || (url.pathname === '/' && window.location.pathname.endsWith('index.html')) || (window.location.pathname === '/' && url.pathname.endsWith('index.html'))) {
      const targetId = url.hash.substring(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        history.pushState(null, null, url.hash);
      }
    }
  });
});

function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initGSAP, 100); return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (document.getElementById('hero-badge')) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('#hero-badge', { y: 30, opacity: 0, duration: 0.6, clearProps: 'all' })
      .from('#hero-title', { y: 40, opacity: 0, duration: 0.7, clearProps: 'all' }, '-=0.3')
      .from('#hero-sub',   { y: 30, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.4')
      .from('#hero-ctas',  { y: 25, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.35')
      .from('#hero-code',  { y: 30, opacity: 0, scale: 0.97, duration: 0.7, clearProps: 'all' }, '-=0.3');
  }

  const docsContainer = document.getElementById('docs-content');
  if (docsContainer) {
    const children = Array.from(docsContainer.children);
    children.forEach(c => c.classList.add('gsap-hidden'));
    gsap.from(children, {
      y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", clearProps: "all"
    });
  }

  gsap.from('#navbar', { y: -60, opacity: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' });

  ['.section-badge', '.section-title', '.section-sub'].forEach((selector, i) => {
    gsap.utils.toArray(selector).forEach(el => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, y: 25, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power2.out', clearProps: 'all' });
    });
  });

  gsap.from('.feature-card', { scrollTrigger: { trigger: '.feature-card', start: 'top 85%' }, y: 40, opacity: 0, scale: 0.96, duration: 0.6, stagger: 0.1, ease: 'power3.out', clearProps: 'all' });
  gsap.from('.step-card', { scrollTrigger: { trigger: '.step-card', start: 'top 85%' }, y: 40, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', clearProps: 'all' });
  gsap.from('.cta-box', { scrollTrigger: { trigger: '.cta-box', start: 'top 85%' }, y: 40, opacity: 0, scale: 0.96, duration: 0.8, ease: 'power3.out', clearProps: 'all' });
}
window.addEventListener('load', initGSAP);

document.querySelectorAll('.feature-card, .step-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.transform = \`perspective(800px) rotateY(\${mx}deg) rotateX(\${my}deg) translateY(-6px)\`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});
`;

// 3. HTML Components
const Header = (activePage) => `
<header id="navbar" class="fixed top-0 left-0 right-0 z-50 nav-blur transition-all duration-300">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="index.html" class="flex items-center gap-3 group">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
        <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 text-white" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
        </svg>
      </div>
      <span class="font-bold text-base tracking-tight dark:text-white text-slate-900">Sequelize<span class="text-indigo-500">AI</span></span>
    </a>

    <nav class="hidden md:flex items-center gap-1">
      <a href="index.html#features" class="px-4 py-2 text-sm font-medium dark:text-slate-400 text-slate-600 hover:text-indigo-500 transition-all rounded-lg">Features</a>
      <a href="index.html#about" class="px-4 py-2 text-sm font-medium dark:text-slate-400 text-slate-600 hover:text-indigo-500 transition-all rounded-lg">About</a>
      <a href="index.html#portfolio" class="px-4 py-2 text-sm font-medium dark:text-slate-400 text-slate-600 hover:text-indigo-500 transition-all rounded-lg">Databases</a>
      <a href="docs-page.html" class="${activePage === "docs" ? "text-indigo-500 bg-indigo-500/10" : "dark:text-slate-400 text-slate-600 hover:text-indigo-500"} px-4 py-2 text-sm font-medium transition-all rounded-lg">Documentation</a>
    </nav>

    <div class="flex items-center gap-3">
      <button id="theme-toggle" class="toggle-track bg-indigo-600 hover:bg-indigo-500 transition-colors">
        <span id="toggle-thumb" class="toggle-thumb bg-white flex items-center justify-center text-[10px]">🌙</span>
      </button>
      <a href="index.html#contact" class="hidden sm:flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg hover:-translate-y-0.5">Contact Us</a>
      <button id="mobile-menu-btn" class="md:hidden p-2 text-slate-400 hover:text-indigo-500">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>

  <div id="mobile-nav" class="hidden md:hidden border-t dark:border-white/5 border-black/5 dark:bg-[#05050f]/95 bg-white/95 px-6 py-4 space-y-1">
    <a href="index.html#features" class="block px-4 py-2 text-sm dark:text-slate-300 text-slate-700 hover:text-indigo-500">Features</a>
    <a href="index.html#about" class="block px-4 py-2 text-sm dark:text-slate-300 text-slate-700 hover:text-indigo-500">About</a>
    <a href="index.html#portfolio" class="block px-4 py-2 text-sm dark:text-slate-300 text-slate-700 hover:text-indigo-500">Databases</a>
    <a href="docs-page.html" class="block px-4 py-2 text-sm dark:text-slate-300 text-slate-700 hover:text-indigo-500">Documentation</a>
  </div>
</header>
`;

const Footer = () => `
<footer class="border-t dark:border-white/5 border-slate-200 py-12 text-slate-500 dark:text-slate-400">
  <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">AI</div>
      <span class="font-bold dark:text-white text-slate-900">Sequelize<span class="text-indigo-500">AI</span></span>
    </div>
    <div class="text-sm">MIT License © 2026 Developer</div>
  </div>
</footer>
`;

const BaseHtml = (title, content, activePage) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | Sequelize AI</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] } } }
    }
  </script>
  <link rel="stylesheet" href="css/style.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="js/main.js" defer></script>
</head>
<body class="antialiased dark:bg-[#050510] bg-[#f8faff] dark:text-slate-100 text-slate-800 transition-colors duration-300">
  ${Header(activePage)}
  ${content}
  ${Footer()}
</body>
</html>
`;

// 4. Landing Page Content
const landingPageContent = `
<main class="w-full min-h-screen relative overflow-hidden">
  
  <!-- HERO -->
  <section id="hero" class="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden hero-bg pt-20 border-b dark:border-white/5 border-slate-200">
    <div class="blob w-[600px] h-[600px] bg-indigo-500/20 top-[-10%] left-[-15%] dark:bg-indigo-500/30"></div>
    <div class="blob w-[500px] h-[500px] bg-cyan-500/20 bottom-[-5%] right-[-10%]"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
      <div id="hero-badge" class="gsap-hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-8">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Production Ready Software
      </div>
      <h1 id="hero-title" class="gsap-hidden text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-slate-900 dark:text-white">
        Query your database<br />
        <span class="gradient-text">in plain English</span>
      </h1>
      <p id="hero-sub" class="gsap-hidden text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Sequelize AI translates English into secure Sequelize ORM queries, executes them safely, and returns clean JSON. Zero backend refactoring required.
      </p>
      
      <div id="hero-ctas" class="gsap-hidden flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <a href="docs-page.html" class="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl shadow-indigo-500/30 hover:-translate-y-1 transition-all">Get Started</a>
        <a href="#about" class="px-8 py-3.5 rounded-xl border dark:border-white/10 border-slate-300 text-slate-700 dark:text-slate-300 font-semibold hover:-translate-y-1 transition-all hover:bg-slate-100 dark:hover:bg-white/5">Learn More</a>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features" class="py-24 relative overflow-hidden dark:bg-transparent bg-white">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-16">
        <div class="section-badge gsap-hidden text-indigo-500 font-semibold mb-2">Features</div>
        <h2 class="section-title gsap-hidden text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Why Sequelize AI?</h2>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="feature-card gsap-hidden glass-card rounded-2xl p-6 group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-2xl">🛡️</div>
          <h3 class="dark:text-white text-slate-900 font-bold mb-2">No SQL Injection</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Forces all queries through Sequelize ORM to prevent destructive raw SQL actions.</p>
        </div>
        <div class="feature-card gsap-hidden glass-card rounded-2xl p-6 group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-2xl">📦</div>
          <h3 class="dark:text-white text-slate-900 font-bold mb-2">Sandboxed V8 Engine</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm">LLM code executes inside an isolated Node.js VM with zero fs/net access.</p>
        </div>
        <div class="feature-card gsap-hidden glass-card rounded-2xl p-6 group cursor-pointer">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-2xl">⚡</div>
          <h3 class="dark:text-white text-slate-900 font-bold mb-2">Multi-provider</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Supports OpenAI, Gemini, Claude, Groq, DeepSeek, and custom LLMs instantly.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section id="about" class="py-24 border-y dark:border-white/5 border-slate-200 dark:bg-white/[0.01] bg-slate-50 relative">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <div class="section-badge gsap-hidden text-indigo-500 font-semibold mb-2">About The Architecture</div>
      <h2 class="section-title gsap-hidden text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8">How it works safely</h2>
      
      <div class="grid md:grid-cols-3 gap-8 relative mt-12">
        <div class="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 opacity-30"></div>
        <div class="step-card gsap-hidden relative z-10 bg-white dark:bg-[#0f0f1c] p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div class="w-12 h-12 mx-auto rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold mb-4">1</div>
          <h4 class="font-bold dark:text-white text-slate-900">Natural Language</h4>
          <p class="text-xs mt-2 text-slate-500">Provide a plain English string.</p>
        </div>
        <div class="step-card gsap-hidden relative z-10 bg-white dark:bg-[#0f0f1c] p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div class="w-12 h-12 mx-auto rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold mb-4">2</div>
          <h4 class="font-bold dark:text-white text-slate-900">LLM Sequelize Code</h4>
          <p class="text-xs mt-2 text-slate-500">AI outputs safe ORM JS objects.</p>
        </div>
        <div class="step-card gsap-hidden relative z-10 bg-white dark:bg-[#0f0f1c] p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div class="w-12 h-12 mx-auto rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mb-4">3</div>
          <h4 class="font-bold dark:text-white text-slate-900">VM Execution</h4>
          <p class="text-xs mt-2 text-slate-500">Runs code securely and returns data.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PORTFOLIO / DATABASES -->
  <section id="portfolio" class="py-24 relative overflow-hidden dark:bg-transparent bg-white">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <div class="section-badge gsap-hidden text-indigo-500 font-semibold mb-2">Projects & Databases</div>
      <h2 class="section-title gsap-hidden text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-12">Supported Everywhere</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">PostgreSQL</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">MySQL</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">SQLite</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">SQL Server</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">MariaDB</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">Snowflake</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">Oracle</div>
        <div class="glass-card rounded-xl p-5 card-hover font-semibold text-slate-800 dark:text-slate-100">IBM Db2</div>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact" class="py-24 border-t dark:border-white/5 border-slate-200 relative overflow-hidden">
    <div class="max-w-3xl mx-auto px-6 text-center relative z-10">
      <div class="cta-box gsap-hidden rounded-3xl p-12 bg-indigo-600 dark:bg-indigo-600/20 shadow-2xl dark:border dark:border-indigo-500/20 text-white">
        <h2 class="text-3xl font-bold mb-4">Join the Open Source Project</h2>
        <p class="text-indigo-100 dark:text-slate-300 mb-8 max-w-lg mx-auto">Get in touch by submitting bugs, proposing features, or writing code on our GitHub repository.</p>
        <a href="https://github.com/jsuyog2/sequelize-ai" target="_blank" class="inline-block px-8 py-3.5 rounded-xl bg-white text-indigo-600 dark:bg-indigo-500 dark:text-white font-bold hover:scale-105 transition-transform shadow-lg">
          Contact on GitHub
        </a>
      </div>
    </div>
  </section>
  
</main>
`;

const docsPageContent = `
<main class="w-full min-h-screen pt-28 pb-20 relative overflow-hidden max-w-4xl mx-auto px-6">
  <div id="docs-content" class="prose dark:prose-invert prose-slate prose-indigo max-w-none 
    prose-headings:font-bold prose-headings:tracking-tight
    prose-a:text-indigo-500 hover:prose-a:text-indigo-600 dark:hover:prose-a:text-indigo-400">
    
    <h1>Documentation & Getting Started</h1>
    
    <h2>Installation</h2>
    <pre><code>npm install @jsuyog2/sequelize-ai sequelize</code></pre>
    <p>Additionally, install the SDK for your preferred AI provider:</p>
    <pre><code>npm install openai                   # For OpenAI & DeepSeek
npm install @google/generative-ai    # For Gemini
npm install @anthropic-ai/sdk        # For Claude
npm install groq-sdk                 # For Groq</code></pre>

    <h2>Basic Setup</h2>
    <pre><code class="language-javascript">const { Sequelize } = require("sequelize");
const SequelizeAI = require("@jsuyog2/sequelize-ai");

// 1. Setup Database
const sequelize = new Sequelize("postgres://user:pass@localhost:5432/db");

// 2. Initialize AI
const ai = new SequelizeAI(sequelize, {
  provider: "openai", // or gemini, claude, groq
  apiKey: process.env.OPENAI_API_KEY
});

// 3. Query
async function run() {
  const result = await ai.ask("show me the cheapest 5 products with stock over 10");
  console.log(result);
}</code></pre>

  </div>
</main>
`;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1" />
      <stop offset="100%" style="stop-color:#22d3ee" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#g)" />
  <circle cx="16" cy="12" rx="9" ry="4" fill="none" stroke="white" stroke-width="1.8" />
  <path d="M7 12v8c0 2.21 4.03 4 9 4s9-1.79 9-4V12" fill="none" stroke="white" stroke-width="1.8" />
  <path d="M7 16c0 2.21 4.03 4 9 4s9-1.79 9-4" fill="none" stroke="white" stroke-width="1.8" />
</svg>`;

// 5. Generate Output Files
fs.writeFileSync(
  path.join(DOCS_DIR, "index.html"),
  BaseHtml("Landing Page", landingPageContent, "index"),
);
fs.writeFileSync(
  path.join(DOCS_DIR, "docs-page.html"),
  BaseHtml("Documentation", docsPageContent, "docs"),
);

fs.writeFileSync(path.join(CSS_DIR, "style.css"), styleCss);
fs.writeFileSync(path.join(JS_DIR, "main.js"), mainJs);
fs.writeFileSync(path.join(DOCS_DIR, "favicon.svg"), faviconSvg);

console.log("✅ Successfully built the GitHub Pages site into /docs");
