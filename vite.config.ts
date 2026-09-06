import { defineConfig,loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { agentMiddleware } from './server/home-agent.mjs';
export default defineConfig(({mode}) => ({
  plugins: [react(), {name:'home-agent-local-api',configureServer(server){server.middlewares.use(agentMiddleware(loadEnv(mode,'.','')));}}],
}));
