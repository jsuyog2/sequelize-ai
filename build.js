// build.js
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

function getEntryPoints(dir, base = dir) {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      entries.push(...getEntryPoints(fullPath, base));
    } else if (entry.name.endsWith(".js")) {
      entries.push(fullPath.replace(/\\/g, "/"));
    }
  }
  return entries;
}

async function build() {
  fs.rmSync("./dist", { recursive: true, force: true });
  console.log("Building...\n");

  const entryPoints = getEntryPoints("src");
  console.log("Entry points found:");
  entryPoints.forEach((f) => console.log(`  • ${f}`));
  console.log();

  await Promise.all([
    esbuild.build({
      entryPoints,
      outdir: "dist",
      platform: "node",
      format: "cjs",
      bundle: false,
      minify: true,
      sourcemap: true,
      logLevel: "info",
    }),
    esbuild.build({
      entryPoints,
      outdir: "dist",
      platform: "node",
      format: "esm",
      outExtension: { ".js": ".mjs" },
      bundle: false,
      minify: true,
      sourcemap: true,
      logLevel: "info",
    }),
  ]);

  console.log("\n✅ Build complete → dist/");
}

build().catch((e) => {
  console.error("❌ Build failed:", e.message);
  process.exit(1);
});
