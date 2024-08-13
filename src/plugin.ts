import fs from 'fs'
import path from 'path'

import { type Plugin } from 'rollup'
import { loadSync } from 'tsconfig'

import { processDTSFileData } from './processDTSFileData'
import { makeResolvePathAlias } from './resolvePathAlias'

export default function dtsPathAliasPlugin(options: { cwd?: string } = {}): Plugin {
  const { config: tsconfig, path: tsconfigPath } = loadSync(options?.cwd ?? process.cwd())

  if (!tsconfig || !tsconfigPath) {
    throw new Error(`Could not load paths from tsconfig.json`)
  }

  const baseUrl = tsconfig?.compilerOptions?.baseUrl ?? './'

  const resolvePathAlias = makeResolvePathAlias(tsconfigPath)

  return {
    name: 'dts-path-alias',
    writeBundle: {
      order: 'post',
      handler(options, bundle) {
        if (baseUrl) {
          for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
            if (chunkOrAsset.type === 'asset' && fileName.endsWith('.d.ts')) {
              const { fileName } = chunkOrAsset
              const inputFilePath = path.join(baseUrl, fileName)
              const outputFilePath = path.join(options.dir!, fileName)

              const pathResolver = (source: string) => resolvePathAlias(inputFilePath, source)

              const data = fs.readFileSync(outputFilePath, { encoding: 'utf8' })

              const modifiedData = processDTSFileData(data, pathResolver)

              fs.writeFileSync(outputFilePath, modifiedData)
            }
          }
        }
      },
    },
  }
}
