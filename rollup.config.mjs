import commonjs from '@rollup/plugin-commonjs'

import del from 'rollup-plugin-delete'
import process from 'node:process'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  defineConfig({
    input: ['./src/index.ts'],
    output: [
      {
        file: './dist/index.cjs.js',
        format: 'commonjs',
        sourcemap: true,
      },
      {
        file: './dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      del({ targets: 'dist', runOnce: true }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
        preventAssignment: true,
      }),
      typescript(),
      nodeResolve(),
      commonjs(),
    ],
  }),
  defineConfig({
    input: './dist/types/index.d.ts',
    output: [{ file: './dist/index.d.ts', format: 'esm' }],
    plugins: [dts(), del({ hook: 'buildEnd', targets: 'dist/types' })],
  }),
]
