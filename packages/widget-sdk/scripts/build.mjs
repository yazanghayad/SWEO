import { build } from 'esbuild';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const shared = {
  entryPoints: [
    resolve(root, 'src/index.ts'),
    resolve(root, 'src/react.ts')
  ],
  bundle: true,
  target: ['es2020'],
  platform: 'browser',
  sourcemap: true,
  external: ['react']
};

// ESM
await build({
  ...shared,
  format: 'esm',
  outdir: resolve(root, 'dist/esm'),
  outExtension: { '.js': '.mjs' }
});

// CJS
await build({
  ...shared,
  format: 'cjs',
  outdir: resolve(root, 'dist/cjs'),
  outExtension: { '.js': '.cjs' }
});

// Type declarations
execSync('npx tsc --project tsconfig.build.json', { cwd: root, stdio: 'inherit' });

console.log('✅ Built @sweo/widget → dist/');
