import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";

// eslint-config-next exports a function that returns the config array
const nextConfig = typeof next === 'function' ? next() : next;

const eslintConfig = defineConfig([
  ...nextConfig,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;