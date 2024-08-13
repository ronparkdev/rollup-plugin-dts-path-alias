import path from 'path'

import type { TsconfigPaths } from './define'

export function resolvePathAlias({
  baseUrl,
  currentFilePath,
  source,
  aliasPaths,
}: {
  baseUrl: string
  currentFilePath: string
  source: string
  aliasPaths: TsconfigPaths
}): string | null {
  const resolvedPath = (() => {
    for (const alias in aliasPaths) {
      const aliasPattern = new RegExp(`^${alias.replace('*', '(.*)')}$`)
      const match = source.match(aliasPattern)

      if (match) {
        return aliasPaths[alias][0].replace('*', match[1])
      }
    }

    return source
  })()

  const absoluteResolvedPath = path.resolve(baseUrl, resolvedPath)
  const relativePath = path.relative(path.dirname(currentFilePath), absoluteResolvedPath)
  const relativePathWithDotSlash =
    relativePath.startsWith('./') || relativePath.startsWith('../') ? relativePath : `./${relativePath}`

  return relativePathWithDotSlash
}
