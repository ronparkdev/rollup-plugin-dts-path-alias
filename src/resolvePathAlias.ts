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
  const currentDirPath = path.dirname(currentFilePath)
  const resolvedPath = (() => {
    for (const alias in aliasPaths) {
      const aliasPattern = new RegExp(`^${alias.replace('*', '(.*)')}$`)
      const match = source.match(aliasPattern)

      if (match) {
        return path.join(baseUrl, aliasPaths[alias][0].replace('*', match[1]))
      }
    }

    return path.join(currentDirPath, source)
  })()

  const relativePath = path.relative(currentDirPath, resolvedPath)
  const relativePathWithDotSlash =
    relativePath.startsWith('./') || relativePath.startsWith('../') ? relativePath : `./${relativePath}`

  return relativePathWithDotSlash
}
