import { TailwindConfig } from "@react-email/components";

export const twConfig: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        brand: "#4CAF50",
        offwhite: "#fafbfb",
      },
      spacing: {
        0: "0px",
        20: "20px",
        45: "45px",
      },
    },
  },
  prefix: "",
  important: false,
  separator: ":",
  safelist: "",
  blocklist: "",
  presets: "",
  future: "",
  experimental: "",
  darkMode: false,
  corePlugins: "",
  plugins: [],
};
