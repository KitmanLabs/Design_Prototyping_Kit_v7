import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { playbookAliases } from './vite.aliases.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(() => {
  return {
    plugins: [
      react({ include: /\.(jsx|js|tsx|ts)$/ }),
    ],
    resolve: {
      // iP monorepo package names mapped onto src/playbook-components (vite.aliases.mjs).
      alias: playbookAliases(__dirname),
    },
    server: {
      port: 3001,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      server: {
        deps: {
          // The Scheduler deep-imports @atlaskit/pragmatic-drag-and-drop by directory, which
          // Node's ESM loader rejects. Letting Vite transform these packages resolves it, as in the app.
          inline: [/@mui\/x-scheduler/, /@atlaskit\/pragmatic-drag-and-drop/],
        },
      },
    },
  }
})
