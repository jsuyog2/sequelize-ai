// build.js
const esbuild = require("esbuild");
const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");

const ENTRY_POINTS = [
  "src/index.js",
  "src/getSchemaContext.js",
  "src/getSystemPrompt.js",
  "src/secureExecute.js",
  "src/translateOps.js",
  "src/validateGeneratedCode.js",
  "src/providers/openai.provider.js",
  "src/providers/gemini.provider.js",
  "src/providers/claude.provider.js",
  "src/providers/groq.provider.js",
  "src/providers/openai-compatible.provider.js",
];

async function build() {
  // Clean dist/
  fs.rmSync("./dist", { recursive: true, force: true });
  console.log("Building...\n");

  // Step 1 — esbuild: bundle each file as CJS
  await esbuild.build({
    entryPoints: ENTRY_POINTS,
    outdir: "dist",
    platform: "node",
    format: "cjs",
    bundle: false,
    sourcemap: false, // no sourcemaps — defeats obfuscation
    logLevel: "silent",
  });

  // Step 2 — obfuscate every output file
  function obfuscateDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        obfuscateDir(fullPath);
      } else if (entry.name.endsWith(".js")) {
        const src = fs.readFileSync(fullPath, "utf8");

        const obfuscated = JavaScriptObfuscator.obfuscate(src, {
          compact: true,
          controlFlowFlattening: true, // scrambles logic flow
          controlFlowFlatteningThreshold: 0.5,
          deadCodeInjection: true, // injects fake code
          deadCodeInjectionThreshold: 0.2,
          debugProtection: false, // skip — breaks Node.js
          disableConsoleOutput: false, // keep console.log working
          identifierNamesGenerator: "hexadecimal", // _0x1a2b3c style
          renameGlobals: false, // don't rename requires
          rotateStringArray: true,
          selfDefending: false, // skip — breaks Node.js
          shuffleStringArray: true,
          splitStrings: true, // splits "hello" → "hel"+"lo"
          splitStringsChunkLength: 5,
          stringArray: true, // moves strings to array
          stringArrayCallsTransform: true,
          stringArrayEncoding: ["base64"],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 2,
          stringArrayThreshold: 0.75,
          unicodeEscapeSequence: false,
          target: "node",
        });

        fs.writeFileSync(fullPath, obfuscated.getObfuscatedCode(), "utf8");
        console.log(`  ✓ ${path.relative(__dirname, fullPath)}`);
      }
    }
  }

  obfuscateDir("./dist");
  console.log("\n✅ Build complete → dist/");
}

build().catch((e) => {
  console.error("❌ Build failed:", e.message);
  process.exit(1);
});
