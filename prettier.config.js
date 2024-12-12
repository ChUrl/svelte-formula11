/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  // Plugin configs
  plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app.css",
  tailwindConfig: "./tailwind.config.ts",

  // Global formatting options
  printWidth: 100,
  tabWidth: 2,
  tabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: "always",

  // File specific configuration options
  overrides: [
    {
      files: "*.svelte",
      options: { parser: "svelte" },
    },
  ],
};

export default config;
