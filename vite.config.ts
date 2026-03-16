import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { CommonServerOptions, defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const proxy: CommonServerOptions['proxy'] = {
    '/api': {
      target: env.VITE_API_URL || 'http://localhost:8083',
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@green-ribbon/banksalad-mock-admin/src': resolve(__dirname, 'src'),
      },
    },
    server: {
      host: true,
      port: 3010,
      proxy: mode === 'development' ? proxy : undefined,
    },
    build: {
      outDir: './build',
      sourcemap: 'hidden',
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
  };
});
