import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/index.ts"],
    format: ['cjs', 'esm'],
    target: 'esnext',
    dts: true,
    treeshake: true,
    sourcemap: true,
    clean: true,
});
