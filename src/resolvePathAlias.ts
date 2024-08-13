import path from 'path'

import ts from 'typescript'

export function makeResolvePathAlias(tsconfigFilePath: string) {
  const tsconfigFolderPath = path.dirname(tsconfigFilePath)

  const compilerOptions = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsconfigFilePath, ts.sys.readFile).config,
    ts.sys,
    path.dirname(tsconfigFilePath),
  ).options
  const host = ts.createCompilerHost(compilerOptions)

  return function resolver(inputFilePath: string, source: string): string | null {
    const { resolvedModule } = ts.resolveModuleName(source, inputFilePath, compilerOptions, host)

    if (resolvedModule === undefined || resolvedModule.isExternalLibraryImport) {
      return null
    }

    const { resolvedFileName } = resolvedModule

    const parsedResolvedFileName = path.parse(resolvedFileName)

    const inputFolderPath = path.dirname(inputFilePath)

    const relativePath = path.relative(
      path.join(tsconfigFolderPath, inputFolderPath),
      path.join(parsedResolvedFileName.dir, parsedResolvedFileName.name),
    )

    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
  }
}
