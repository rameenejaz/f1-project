import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devPort = Number(env.VITE_DEV_PORT) || 5175;
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5051';

  return {
    plugins: [react()],
    server: {
      port: devPort,
      strictPort: false,
      proxy: {
        '/teams': { target: apiTarget, changeOrigin: true },
        '/drivers': { target: apiTarget, changeOrigin: true },
        '/seasons': { target: apiTarget, changeOrigin: true },
        '/races': { target: apiTarget, changeOrigin: true },
        '/stats': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
