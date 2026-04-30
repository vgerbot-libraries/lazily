import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

export default defineConfig({
    input: join(currentDir, 'dist/src/index.d.ts'),
    output: [
        {
            file: join(currentDir, 'dist/index.d.ts'),
            format: 'esm',
        },
    ],
    plugins: [
        dts({
            tsconfig: join(currentDir, 'tsconfig.dts.json'),
        }),
    ],
    external: [],
});
