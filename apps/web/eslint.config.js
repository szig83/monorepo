import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    // Disable turbo env var rule specifically for the env file in this app
    files: ["./src/lib/env.ts"],
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
