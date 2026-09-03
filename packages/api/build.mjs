import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  outfile: "dist/index.js",
  format: "esm",
  packages: "external",
  sourcemap: true,
  alias: { src: "./src" },
});
