import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "http://my-terra-proj-alb-991685342.us-east-1.elb.amazonaws.com",
        changeOrigin: true,
      },
    },
  },
});