import { resolvePathAlias } from './resolvePathAlias'

describe('resolvePathAlias', () => {
  const aliasPaths = {
    '@foo/*': ['foo/*'],
    bar: ['_bar'],
  }

  it('should resolve "foo/*" alias correctly as a relative path', () => {
    const importPath = '@foo/someModule'
    const baseUrl = '/Users/project/src'
    const currentFilePath = '/Users/project/src/index.ts'

    const result = resolvePathAlias({ source: importPath, aliasPaths, currentFilePath, baseUrl })

    expect(result).toBe('./foo/someModule')
  })

  it('should resolve "bar" alias correctly as a relative path', () => {
    const importPath = 'bar'
    const baseUrl = '/Users/project/src'
    const currentFilePath = '/Users/project/src/index.ts'

    const result = resolvePathAlias({ source: importPath, aliasPaths, currentFilePath, baseUrl })

    expect(result).toBe('./_bar')
  })

  it('should resolve based on baseUrl', () => {
    const importPath = 'baz'
    const baseUrl = '/Users/project/src'
    const currentFilePath = '/Users/project/src/utils/index.ts'

    const result = resolvePathAlias({ source: importPath, aliasPaths, currentFilePath, baseUrl })

    expect(result).toBe('../baz')
  })
})
