import { isBuiltin } from "node:module";
import { defineConfig } from "tsdown";

const externalizedDependencies = [
  /^@nestjs\/microservices(?:\/|$)/,
  /^@nestjs\/platform-socket\.io(?:\/|$)/,
  /^@nestjs\/swagger(?:\/|$)/,
  /^@nestjs\/websockets(?:\/|$)/,
  /^class-transformer(?:\/|$)/,
  /^class-validator(?:\/|$)/,
];

export default defineConfig({
  entry: { server: "src/main.ts" },
  platform: "node",
  target: "node22.18",
  format: "esm",
  clean: true,
  hash: false,
  outputOptions: {
    codeSplitting: false,
  },
  deps: {
    onlyBundle: false,
    alwaysBundle: (id) =>
      !isBuiltin(id) &&
      !externalizedDependencies.some((pattern) => pattern.test(id)),
    neverBundle: externalizedDependencies,
  },
});
