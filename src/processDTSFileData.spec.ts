import { processDTSFileData } from './processDTSFileData'

describe('processDTSFileData', () => {
  const resolver = jest.fn()

  it('should replace import source with resolved path', () => {
    const input = `
        import foo from 'foo';
        import bar from 'bar';
      `
    resolver.mockImplementation(source => {
      if (source === 'foo') return 'resolved/foo'
      if (source === 'bar') return 'resolved/bar'
      return null
    })

    const result = processDTSFileData(input, resolver)
    const expected = `
        import foo from 'resolved/foo';
        import bar from 'resolved/bar';
      `
    expect(result).toBe(expected)
  })

  it('should replace export all source with resolved path', () => {
    const input = `
        export * from 'foo';
        export * from 'bar';
      `
    resolver.mockImplementation(source => {
      if (source === 'foo') return 'resolved/foo'
      if (source === 'bar') return 'resolved/bar'
      return null
    })

    const result = processDTSFileData(input, resolver)
    const expected = `
        export * from 'resolved/foo';
        export * from 'resolved/bar';
      `
    expect(result).toBe(expected)
  })

  it('should replace export named source with resolved path', () => {
    const input = `
        export { foo } from 'foo';
        export { bar } from 'bar';
      `
    resolver.mockImplementation(source => {
      if (source === 'foo') return 'resolved/foo'
      if (source === 'bar') return 'resolved/bar'
      return null
    })

    const result = processDTSFileData(input, resolver)
    const expected = `
        export { foo } from 'resolved/foo';
        export { bar } from 'resolved/bar';
      `
    expect(result).toBe(expected)
  })

  it('should not modify when resolver returns null', () => {
    const input = `
        import foo from 'foo';
        export * from 'bar';
        export { baz } from 'baz';
      `
    resolver.mockImplementation(() => null)

    const result = processDTSFileData(input, resolver)
    expect(result).toBe(input)
  })

  it('should handle mixed cases correctly', () => {
    const input = `
        import foo from 'foo';
        export * from 'bar';
        export { baz } from 'baz';
      `
    resolver.mockImplementation(source => {
      if (source === 'foo') return 'resolved/foo'
      if (source === 'bar') return null
      if (source === 'baz') return 'resolved/baz'
      return null
    })

    const result = processDTSFileData(input, resolver)
    const expected = `
        import foo from 'resolved/foo';
        export * from 'bar';
        export { baz } from 'resolved/baz';
      `
    expect(result).toBe(expected)
  })
})
