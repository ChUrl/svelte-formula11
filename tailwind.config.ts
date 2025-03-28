import type { Config } from "tailwindcss";
import { skeleton } from "@skeletonlabs/tw-plugin";
import { join } from "path";
import { formula11Theme } from "./tailwind.formula11";
import forms from "@tailwindcss/forms";

const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}"),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    forms,
    skeleton({
      themes: {
        custom: [formula11Theme],
      },
    }),
  ],
  safelist: [
    // List all patterns that are used dynamically, e.g. class="variant-filled-{color}"
    {
      pattern: /variant-filled-+/,
    },
    {
      pattern: /w-full/,
    },
    {
      pattern: /w-auto/,
    },
  ],
} satisfies Config;

export default config;
