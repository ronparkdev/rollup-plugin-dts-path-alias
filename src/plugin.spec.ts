import fs from 'fs'
import os from 'os'
import path from 'path'

import { afterEach, describe, expect, it } from '@jest/globals'
import { rollup } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import { v4 as uuidv4 } from 'uuid'

import { dtsPathAliasPlugin } from './plugin'

describe('dtsPathAliasPlugin', () => {
  let basePath: string

  beforeEach(() => {
    basePath = path.join(fs.realpathSync(os.tmpdir()), uuidv4())
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true })
    }
  })

  afterEach(() => {
    try {
      fs.rmdirSync(basePath, { recursive: true })
    } catch {
      // ignore
    }
  })

  it('should correctly resolve paths in .d.ts files', async () => {
    const fileMap: { [filePath: string]: string } = {
      'src/index.ts': `import { foo } from '@/foo';\nimport { bar } from 'bar';\nexport { foo, bar };\n`,
      'src/foo.ts': 'export type Foo = () => void;\nexport const foo: Foo = () => {};\n',
      'src/utils/bar.ts': `import { type Foo } from '@/foo';\nexport const bar: Foo = () => {};\n`,
      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            rootDir: './src',
            baseUrl: './src',
            paths: {
              '@/*': ['*'],
              bar: ['utils/bar'],
            },
            declaration: true,
            outDir: 'dist',
          },
          include: ['./src/**/*.ts'],
          exclude: ['./node_modules'],
        },
        undefined,
        2,
      ),
    }

    Object.keys(fileMap).forEach(filePath => {
      const folderPath = path.join(basePath, path.dirname(filePath))
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }
      fs.writeFileSync(path.join(basePath, filePath), fileMap[filePath])
    })

    const bundle = await rollup({
      input: path.join(basePath, 'src/index.ts'),
      external: ['@my-lib/foo', '~/bar', 'baz'],
      plugins: [
        typescript({
          cwd: basePath,
          tsconfig: path.join(basePath, 'tsconfig.json'),
        }),
        dtsPathAliasPlugin({ cwd: basePath }),
      ],
    })

    await bundle.write({
      dir: path.join(basePath, 'dist'),
      format: 'es',
      exports: 'named',
    })

    const generatedIndexDTS = fs.readFileSync(path.join(basePath, 'dist/index.d.ts'), 'utf8')
    const generatedBarDTS = fs.readFileSync(path.join(basePath, 'dist/utils/bar.d.ts'), 'utf8')

    expect(generatedIndexDTS).toContain(`import { foo } from './foo';`)
    expect(generatedIndexDTS).toContain(`import { bar } from './utils/bar';`)
    expect(generatedBarDTS).toContain(`import { type Foo } from '../foo';`)
  })

  it('should throw an error if tsconfig.json is missing or invalid', () => {
    expect(() => {
      dtsPathAliasPlugin({ cwd: basePath })
    }).toThrow('Could not load paths from tsconfig.json')
  })
})
