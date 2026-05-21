import {defineConfig} from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],

    build: {
      assetsInlineLimit: 0,
      target: "es2020",
    },

    esbuild: {
      target: "es2020",
    },

    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
      },
    },

    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};