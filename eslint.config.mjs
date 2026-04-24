import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Scripts: CanonicalStateLaws has typed sub-fields with any-cast risk
  {
    ignores: [
      "script/generate-laws-from-canonical.ts",
      "script/validate-laws-consistency.ts",
      "script/verify-and-fill-*.ts",
    ],
  },
  {
    files: ["script/**"],
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // @ducanh2912/next-pwa build output in public/
    "public/sw.js",
    "public/workbox-*.js",
    "public/fallback-*.js",
    "public/swe-worker-*.js",
  ]),
]);

export default eslintConfig;
