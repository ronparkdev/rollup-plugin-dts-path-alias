import fs from 'fs'
import path from 'path'

import { type Plugin } from 'rollup'
import { loadSync } from 'tsconfig'

import { processDTSFileData } from './processDTSFileData'
import { resolvePathAlias } from './resolvePathAlias'

export default function dtsPathAliasPlugin(options: { cwd?: string } = {}): Plugin {
  const { config, path: configPath } = loadSync(options?.cwd ?? process.cwd())

  if (!config || !configPath) {
    throw new Error(`Could not load paths from tsconfig.json`)
  }

  const aliasPaths = config?.compilerOptions?.paths ?? {}

  return {
    name: 'dts-path-alias',
    writeBundle: {
      order: 'post',
      handler(options, bundle) {
        const baseUrl = options.dir
        if (baseUrl) {
          for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
            if (chunkOrAsset.type === 'asset' && fileName.endsWith('.d.ts')) {
              const filePath = path.join(baseUrl, chunkOrAsset.fileName)

              const pathResolver = (source: string) =>
                resolvePathAlias({ source, baseUrl, currentFilePath: filePath, aliasPaths })

              const data = fs.readFileSync(filePath, { encoding: 'utf8' })

              const modifiedData = processDTSFileData(data, pathResolver)

              fs.writeFileSync(filePath, modifiedData)
            }
          }
        }
      },
    },
  }
}
