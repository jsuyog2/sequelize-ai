const fs = require("fs");
const path = require("path");

const Layout = (title, content, activePage) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Sequelize AI</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          },
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Inter', sans-serif; }
    .nav-link { display: block; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-weight: 500; color: #475569; transition: all 0.2s; }
    .nav-link:hover { background-color: #f1f5f9; color: #0f172a; }
    .nav-link.active { background-color: #eff6ff; color: #1d4ed8; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased">
  
  <div class="min-h-screen grid md:grid-cols-[250px_1fr]">
    
    <!-- Sidebar -->
    <aside class="bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0">
      <div class="p-6 border-b border-slate-200 flex items-center gap-3">
        <img src="favicon.svg" class="w-8 h-8" alt="Logo">
        <span class="font-bold text-lg text-slate-900">Sequelize AI</span>
      </div>
      <nav class="p-4 flex-1 overflow-y-auto space-y-1">
        <a href="index.html" class="nav-link ${activePage === "index" ? "active" : ""}">Introduction</a>
        <a href="getting-started.html" class="nav-link ${activePage === "getting-started" ? "active" : ""}">Getting Started</a>
        <a href="architecture.html" class="nav-link ${activePage === "architecture" ? "active" : ""}">Architecture & Security</a>
        <a href="examples.html" class="nav-link ${activePage === "examples" ? "active" : ""}">Examples</a>
        <a href="api.html" class="nav-link ${activePage === "api" ? "active" : ""}">API Reference</a>
      </nav>
      <div class="p-4 border-t border-slate-200">
        <a href="https://github.com/jsuyog2/sequelize-ai" target="_blank" class="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
          <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path></svg>
          GitHub Repository
        </a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-x-hidden min-w-0 bg-slate-50">
      
      <!-- Mobile Header -->
      <header class="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="favicon.svg" class="w-7 h-7" alt="Logo">
          <span class="font-bold text-slate-900">Sequelize AI</span>
        </div>
        <button id="mobile-menu-btn" class="p-2 text-slate-500 hover:text-slate-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </header>

      <!-- Mobile Nav Dropdown -->
      <nav id="mobile-nav" class="md:hidden hidden bg-white border-b border-slate-200 p-4 space-y-2 relative z-0">
        <a href="index.html" class="nav-link ${activePage === "index" ? "active" : ""}">Introduction</a>
        <a href="getting-started.html" class="nav-link ${activePage === "getting-started" ? "active" : ""}">Getting Started</a>
        <a href="architecture.html" class="nav-link ${activePage === "architecture" ? "active" : ""}">Architecture</a>
        <a href="examples.html" class="nav-link ${activePage === "examples" ? "active" : ""}">Examples</a>
        <a href="api.html" class="nav-link ${activePage === "api" ? "active" : ""}">API Reference</a>
      </nav>

      <div class="max-w-4xl mx-auto p-6 md:p-12 lg:p-16 w-full">
        <div class="prose prose-slate prose-blue max-w-none prose-headings:font-semibold prose-a:font-medium">
          ${content}
        </div>
      </div>
    </main>
  </div>
  
  <script>
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('mobile-nav').classList.toggle('hidden');
    });
  </script>
</body>
</html>
`;

const pages = {
  index: {
    title: "Introduction",
    content: `
      <h1>Sequelize AI</h1>
      <p class="lead text-xl text-slate-600 mb-8">Query your database in plain English safely.</p>
      
      <p><code>sequelize-ai</code> is a library that translates natural language queries into secure <code>Sequelize</code> code that is executed inside an isolated V8 sandbox directly returning JSON.</p>
      
      <h2>Why use it?</h2>
      <ul>
        <li><strong>No SQL Injection</strong>: Bypasses the danger of generative text-to-SQL by forcing all queries through your ORM.</li>
        <li><strong>Read-only Sandbox</strong>: Prevents accidental <code>update</code>, <code>destroy</code>, or <code>drop</code> commands. CPU and Memory limits are enforced per-execution.</li>
        <li><strong>Multiple Providers</strong>: Out-of-the-box support for OpenAI, Gemini, Claude, Groq, and DeepSeek.</li>
        <li><strong>Complex Querying</strong>: Supports cross-table JOINS via associations, math computations, multi-query aggregation, and exact schema awareness.</li>
      </ul>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
        <h3 class="text-blue-900 mt-0">Ready to build?</h3>
        <p class="text-blue-800 mb-4">Head over to the Getting Started guide to install and configure your first AI integration.</p>
        <a href="getting-started.html" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Get Started &rarr;</a>
      </div>
    `,
  },
  "getting-started": {
    title: "Getting Started",
    content: `
      <h1>Getting Started</h1>
      
      <h2>Installation</h2>
      <pre><code>npm install @jsuyog2/sequelize-ai sequelize pg pg-hstore</code></pre>
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

// 2. Define Models
const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2) },
  stock: { type: DataTypes.INTEGER }
});

// 3. Initialize AI
const ai = new SequelizeAI(sequelize, {
  provider: "openai", // or gemini, claude, groq
  apiKey: process.env.OPENAI_API_KEY
});

// 4. Query
async function run() {
  const result = await ai.ask("show me the cheapest 5 products with stock over 10");
  console.log(result);
  
  // Output:
  // {
  //   model: "Product",
  //   method: "findAll",
  //   data: [ { name: "Pen", price: "1.00", stock: 15 }, ... ]
  // }
}</code></pre>

      <h2>AI Column Hints</h2>
      <p>Give the AI better context by adding an <code>aiDescription</code> to your models:</p>
      <pre><code class="language-javascript">price: {
  type: DataTypes.DECIMAL(10, 2),
  aiDescription: "Selling price in USD. Use this for earnings calculations."
}</code></pre>
    `,
  },
  architecture: {
    title: "Architecture & Security",
    content: `
      <h1>Security First</h1>
      
      <p>When giving AI the ability to query a database, the biggest fear is <strong>accidental deletion</strong> or <strong>SQL injection</strong>.</p>
      
      <h2>1. ORM Wrapper vs Raw SQL</h2>
      <p>Unlike other platforms that generate raw SQL queries (which can inject drop table commands), <code>sequelize-ai</code> forces the LLM to output JavaScript that uses your existing Sequelize models.</p>

      <h2>2. The Isolated VM</h2>
      <p>We use <a href="https://github.com/laverdet/isolated-vm">isolated-vm</a> to execute the LLM's generated JavaScript. The sandbox has:</p>
      <ul>
        <li><strong>Zero access</strong> to Node's <code>fs</code>, <code>net</code>, or <code>process.env</code>.</li>
        <li><strong>Hard CPU Timeouts</strong> (killed after 2000ms by default to prevent spin-loops).</li>
        <li><strong>Memory Execution Limits</strong> (128MB max heap).</li>
      </ul>

      <h2>3. The Method Whitelist</h2>
      <p>The code the LLM writes attempts to call a global <code>dbQuery</code> function. This function intercepts the request and verifies the method name!</p>
      <div class="not-prose grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
        <div class="bg-green-50 border border-green-200 text-green-900 rounded p-4">✅ findAll</div>
        <div class="bg-green-50 border border-green-200 text-green-900 rounded p-4">✅ findOne</div>
        <div class="bg-green-50 border border-green-200 text-green-900 rounded p-4">✅ count</div>
        <div class="bg-green-50 border border-green-200 text-green-900 rounded p-4">✅ sum/min/max</div>
        <div class="bg-red-50 border border-red-200 text-red-900 rounded p-4">❌ destroy</div>
        <div class="bg-red-50 border border-red-200 text-red-900 rounded p-4">❌ update</div>
        <div class="bg-red-50 border border-red-200 text-red-900 rounded p-4">❌ create</div>
        <div class="bg-red-50 border border-red-200 text-red-900 rounded p-4">❌ rawQuery</div>
      </div>
      <p>Any attempt to modify data results in a rejected Promise and a secure log failure.</p>
    `,
  },
  examples: {
    title: "Examples",
    content: `
      <h1>Capabilities & Examples</h1>
      
      <h3>Filtering & Comparisons</h3>
      <pre><code>// User: "get products where stock is between 5 and 20"
await ai.ask("get products where stock is between 5 and 20");</code></pre>

      <h3>Computed Columns / Math</h3>
      <p>If you need derived data without writing raw sql:</p>
      <pre><code>// User: "show product name and potential earnings if all stock sold"
// AI successfully derives the math automatically:
// SELECT "name", ("stock" * "price") AS "earnings" FROM ...
await ai.ask("show product name and potential earnings if all stock sold");</code></pre>

      <h3>Multiple Queries Independently</h3>
      <pre><code>// User: "how many products are there, and what is the total stock?"
const results = await ai.ask("how many products are there, and what is the total stock?");
// results === [
//   { method: "count", data: 15 },
//   { method: "sum", data: 405 }
// ]</code></pre>

      <h3>Relational Associations</h3>
      <p>The schema understands table relationships mapping directly to Sequelize <code>include</code> arrays.</p>
      <pre><code>// User: "Find all log messages generated by people with the 'manager' role"
await ai.ask("Find all log messages generated by people with the 'manager' role");</code></pre>
    `,
  },
  api: {
    title: "API Reference",
    content: `
      <h1>API Reference</h1>

      <p>The core configuration object for <code>SequelizeAI</code>.</p>
      
      <pre><code class="language-javascript">new SequelizeAI(sequelizeInstance, options)</code></pre>
      
      <h2>Options Parameter</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-300">
              <th class="p-3">Property</th>
              <th class="p-3">Type</th>
              <th class="p-3">Default</th>
              <th class="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200 bg-white">
              <td class="p-3 font-mono text-blue-600">provider</td>
              <td class="p-3"><code>string</code></td>
              <td class="p-3"><code>"openai"</code></td>
              <td class="p-3 text-sm">LLM Engine. Choose from <code>openai</code>, <code>gemini</code>, <code>claude</code>, <code>groq</code>, <code>deepseek</code>, <code>openrouter</code>, <code>together</code></td>
            </tr>
            <tr class="border-b border-slate-200 bg-slate-50">
              <td class="p-3 font-mono text-blue-600">apiKey</td>
              <td class="p-3"><code>string</code></td>
              <td class="p-3"><em>Required</em></td>
              <td class="p-3 text-sm">The private API key for the chosen provider.</td>
            </tr>
            <tr class="border-b border-slate-200 bg-white">
              <td class="p-3 font-mono text-blue-600">model</td>
              <td class="p-3"><code>string</code></td>
              <td class="p-3"><em>Smart Default</em></td>
              <td class="p-3 text-sm">Optionally override the model (e.g., <code>gpt-4o</code> instead of the default <code>gpt-4o-mini</code>)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="mt-8">Instance Methods</h2>
      
      <h3><code class="text-blue-600">ask(prompt: string): Promise&lt;any&gt;</code></h3>
      <p>Compiles your schema, generates code via the LLM provider, safely evaluates it, and returns the query JSON result.</p>
      <p><strong>Returns Signature:</strong></p>
      <pre><code class="language-typescript">type Result = {
  model: string;
  method: "findAll" | "findOne" | "count" | "sum" | "min" | "max" | "average";
  data: any; // Raw db rows/value
} | Result[] // If multiple disjoint queries are spawned
</code></pre>
    `,
  },
};

// Generate HTML files
Object.entries(pages).forEach(([slug, info]) => {
  fs.writeFileSync(
    path.join(__dirname, "docs", `${slug}.html`),
    Layout(info.title, info.content, slug),
  );
  console.log(`✅ Generated docs/${slug}.html`);
});
