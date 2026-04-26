import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The project has a large amount of marketing copy and static content pages.
  // Escaping every apostrophe/quote hurts readability and doesn't improve runtime correctness.
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
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
  // Tests: allow pragmatic fixtures/mocks.
  {
    files: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
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
