import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // pull in all of Next’s recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // now add/override any rules you need
  {
    rules: {
      // allow `any` for now
      "@typescript-eslint/no-explicit-any": "off",

      // warn (instead of error) on unused vars,
      // but ignore any args that start with `_`
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
    },
  },
];
