import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

export default defineConfig({
    input: join(currentDir, 'src/index.ts'),
    output: [
        {
            file: join(currentDir, 'dist/index.esm.js'),
            format: 'esm',
            sourcemap: true,
        }
    ],
    plugins: [
        nodeResolve({
            preferBuiltins: true,
        }),
        esbuild({
            target: 'es2022',
            minify: false,
            tsconfig: join(currentDir, 'tsconfig.lib.json'),
        }),
    ],
    external: [],
});
