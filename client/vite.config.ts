import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

// App-slot port (docs/RULES.md §13, this app: 3001): `make web`/`dev` pass
// `--port`, which wins; standalone `npm run dev|preview` reads WEB_PORT from
// the environment or client/.env (3001 default), always with strictPort.
const webPort = () => {
  const env = loadEnv(process.env.NODE_ENV ?? 'development', import.meta.dirname, '')
  const raw = process.env.WEB_PORT ?? env.WEB_PORT ?? '3001'
  const port = Number.parseInt(raw, 10)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`vite.config: invalid WEB_PORT=${JSON.stringify(raw)}`)
  }
  return port
}

// https://vite.dev/config/
export default defineConfig(() => {
  const port = webPort()
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
  }
})
