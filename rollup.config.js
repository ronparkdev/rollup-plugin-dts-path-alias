import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'
import process from 'node:process'

export default [
  defineConfig({
    input: ['./src/index.ts'],
    output: {
      file: './dist/index.js',
      format: 'es',
      sourcemap: true,
    },
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
]
