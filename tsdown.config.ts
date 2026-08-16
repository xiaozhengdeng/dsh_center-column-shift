/**
 * dsh_center-column-shift client bundle — mirrors the DeepSeek Harness client
 * bundle protocol (packages/client/tsdown.client.ts):
 *
 * - Emits a CJS closure-factory artifact that calls
 *   `window.__ModuleLoader__.load({ id, factory: (require) => ... })`; the
 *   module id MUST equal the package name, which the host looks up by.
 * - Platform modules (react + runtime) stay external: they resolve through the
 *   loader module table at materialization, never inlined.
 * - The node half (lib/index.js) is emitted by tsc (tsconfig.json); tsdown here
 *   only bundles the tsc-emitted client JS (lib/client/index.js) into the
 *   lib/client.js closure. clean stays off so the node-half output survives.
 */
import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

/** Module id this bundle registers under — must be the package name. */
const PLUGIN_ID: string = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
).name

/** Platform module-table entries the browser answers (external at runtime). */
const CLIENT_EXTERNALS = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-runtime',
  '@deepseek-ai/dsh-client-runtime/client',
]

export default defineConfig({
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'lib/client/index.js' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  external: [...CLIENT_EXTERNALS],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
  },
  noExternal: (id: string) => (CLIENT_EXTERNALS.includes(id) ? undefined : true),
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
