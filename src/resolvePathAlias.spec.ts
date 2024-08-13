import path from 'path'

import tempFiles from '@ronpark/temp-files'

import { makeResolvePathAlias } from './resolvePathAlias'

describe('makeResolvePathAlias', () => {
  let basePath: string
  let tsconfigFilePath: string
  let resolver: ReturnType<typeof makeResolvePathAlias>
  let cleanUpFunc: (() => void) | null = null

  beforeEach(() => {
    ;[basePath, cleanUpFunc] = tempFiles({
      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            baseUrl: './src',
            paths: {
              '@utils/*': ['utils/*'],
              '@components/*': ['components/*'],
            },
          },
        },
        undefined,
        2,
      ),
      'src/someFile.ts': `
        import { helper } from '@utils/helpers';
      `,
      'src/anotherFile.ts': `
        import { Button } from '@components/Button';
      `,
      'src/utils/helpers.ts': `
        export function helper() {}
      `,
      'src/components/Button.ts': `
        export function Button() {}
      `,
      'src/subdir/deeperFile.ts': `
        import { helper } from '@utils/helpers';
      `,
    })
    tsconfigFilePath = path.join(basePath, 'tsconfig.json')
    resolver = makeResolvePathAlias(tsconfigFilePath)
  })

  afterEach(() => {
    cleanUpFunc?.()
  })

  it('should resolve @utils alias to a relative path', () => {
    const inputFilePath = 'src/someFile.ts'
    const source = '@utils/helpers'

    const result = resolver(inputFilePath, source)

    expect(result).toBe('./utils/helpers')
  })

  it('should resolve @components alias to a relative path', () => {
    const inputFilePath = 'src/anotherFile.ts'
    const source = '@components/Button'

    const result = resolver(inputFilePath, source)

    expect(result).toBe('./components/Button')
  })

  it('should return null for external libraries', () => {
    const inputFilePath = 'src/anotherFile.ts'
    const source = 'react'

    const result = resolver(inputFilePath, source)

    expect(result).toBeNull()
  })

  it('should return null for unresolved modules', () => {
    const inputFilePath = 'src/anotherFile.ts'
    const source = '@unknown/unknown'

    const result = resolver(inputFilePath, source)

    expect(result).toBeNull()
  })

  it('should resolve @components alias from a subdirectory to a relative path with ../', () => {
    const inputFilePath = 'src/utils/helpers.ts'
    const source = '@components/Button'

    const result = resolver(inputFilePath, source)

    expect(result).toBe('../components/Button')
  })

  it('should resolve @utils alias from a deeper subdirectory to a relative path with ../../', () => {
    const inputFilePath = 'src/subdir/deeperFile.ts'
    const source = '@utils/helpers'

    const result = resolver(inputFilePath, source)

    expect(result).toBe('../utils/helpers')
  })
})
