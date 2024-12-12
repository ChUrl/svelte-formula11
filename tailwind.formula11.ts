import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin";

export const formula11Theme: CustomThemeConfig = {
  name: "formula11Theme",
  properties: {
    // =~= Theme Properties =~=
    "--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
    "--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
    "--theme-font-color-base": "0 0 0",
    "--theme-font-color-dark": "255 255 255",
    "--theme-rounded-base": "8px",
    "--theme-rounded-container": "8px",
    "--theme-border-base": "1px",
    // =~= Theme On-X Colors =~=
    "--on-primary": "0 0 0",
    "--on-secondary": "0 0 0",
    "--on-tertiary": "0 0 0",
    "--on-success": "var(--color-primary-50)",
    "--on-warning": "0 0 0",
    "--on-error": "255 255 255",
    "--on-surface": "0 0 0",
    // =~= Theme Colors  =~=
    // primary | #F8D7DA
    "--color-primary-50": "254 249 249", // #fef9f9
    "--color-primary-100": "254 247 248", // #fef7f8
    "--color-primary-200": "253 245 246", // #fdf5f6
    "--color-primary-300": "252 239 240", // #fceff0
    "--color-primary-400": "250 227 229", // #fae3e5
    "--color-primary-500": "248 215 218", // #F8D7DA
    "--color-primary-600": "223 194 196", // #dfc2c4
    "--color-primary-700": "186 161 164", // #baa1a4
    "--color-primary-800": "149 129 131", // #958183
    "--color-primary-900": "122 105 107", // #7a696b
    // secondary | #FFF3CD
    "--color-secondary-50": "255 253 248", // #fffdf8
    "--color-secondary-100": "255 253 245", // #fffdf5
    "--color-secondary-200": "255 252 243", // #fffcf3
    "--color-secondary-300": "255 250 235", // #fffaeb
    "--color-secondary-400": "255 247 220", // #fff7dc
    "--color-secondary-500": "255 243 205", // #FFF3CD
    "--color-secondary-600": "230 219 185", // #e6dbb9
    "--color-secondary-700": "191 182 154", // #bfb69a
    "--color-secondary-800": "153 146 123", // #99927b
    "--color-secondary-900": "125 119 100", // #7d7764
    // tertiary | #D1E7DD
    "--color-tertiary-50": "248 251 250", // #f8fbfa
    "--color-tertiary-100": "246 250 248", // #f6faf8
    "--color-tertiary-200": "244 249 247", // #f4f9f7
    "--color-tertiary-300": "237 245 241", // #edf5f1
    "--color-tertiary-400": "223 238 231", // #dfeee7
    "--color-tertiary-500": "209 231 221", // #D1E7DD
    "--color-tertiary-600": "188 208 199", // #bcd0c7
    "--color-tertiary-700": "157 173 166", // #9dada6
    "--color-tertiary-800": "125 139 133", // #7d8b85
    "--color-tertiary-900": "102 113 108", // #66716c
    // success | #198754
    "--color-success-50": "221 237 229", // #ddede5
    "--color-success-100": "209 231 221", // #d1e7dd
    "--color-success-200": "198 225 212", // #c6e1d4
    "--color-success-300": "163 207 187", // #a3cfbb
    "--color-success-400": "94 171 135", // #5eab87
    "--color-success-500": "25 135 84", // #198754
    "--color-success-600": "23 122 76", // #177a4c
    "--color-success-700": "19 101 63", // #13653f
    "--color-success-800": "15 81 50", // #0f5132
    "--color-success-900": "12 66 41", // #0c4229
    // warning | #FFC107
    "--color-warning-50": "255 246 218", // #fff6da
    "--color-warning-100": "255 243 205", // #fff3cd
    "--color-warning-200": "255 240 193", // #fff0c1
    "--color-warning-300": "255 230 156", // #ffe69c
    "--color-warning-400": "255 212 81", // #ffd451
    "--color-warning-500": "255 193 7", // #FFC107
    "--color-warning-600": "230 174 6", // #e6ae06
    "--color-warning-700": "191 145 5", // #bf9105
    "--color-warning-800": "153 116 4", // #997404
    "--color-warning-900": "125 95 3", // #7d5f03
    // error | #DC3545
    "--color-error-50": "250 225 227", // #fae1e3
    "--color-error-100": "248 215 218", // #f8d7da
    "--color-error-200": "246 205 209", // #f6cdd1
    "--color-error-300": "241 174 181", // #f1aeb5
    "--color-error-400": "231 114 125", // #e7727d
    "--color-error-500": "220 53 69", // #DC3545
    "--color-error-600": "198 48 62", // #c6303e
    "--color-error-700": "165 40 52", // #a52834
    "--color-error-800": "132 32 41", // #842029
    "--color-error-900": "108 26 34", // #6c1a22
    // surface | #DDDDDD
    "--color-surface-50": "250 250 250", // #fafafa
    "--color-surface-100": "248 248 248", // #f8f8f8
    "--color-surface-200": "247 247 247", // #f7f7f7
    "--color-surface-300": "241 241 241", // #f1f1f1
    "--color-surface-400": "231 231 231", // #e7e7e7
    "--color-surface-500": "221 221 221", // #DDDDDD
    "--color-surface-600": "199 199 199", // #c7c7c7
    "--color-surface-700": "166 166 166", // #a6a6a6
    "--color-surface-800": "133 133 133", // #858585
    "--color-surface-900": "108 108 108", // #6c6c6c
  },
};
