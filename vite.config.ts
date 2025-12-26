import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    port: 4040,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    nitro({ preset: "vercel" }),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    tailwindcss(),
  ],
});
