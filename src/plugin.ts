import fs from 'fs'
import path from 'path'

import { type Plugin } from 'rollup'
import { loadSync } from 'tsconfig'
import ts from 'typescript'

import { processDTSFileData } from './processDTSFileData'
import { resolvePathAlias } from './resolvePathAlias'

export default function dtsPathAliasPlugin(options: { cwd?: string } = {}): Plugin {
  const cwd = options?.cwd ?? process.cwd()
  const { config, path: configPath } = loadSync(options?.cwd ?? process.cwd())

  if (!config || !configPath) {
    throw new Error(`Could not load paths from tsconfig.json`)
  }

  const aliasPaths = config?.compilerOptions?.paths ?? {}
  const baseUrl = config?.compilerOptions?.baseUrl ?? './'

  return {
    name: 'dts-path-alias',
    writeBundle: {
      order: 'post',
      handler(options, bundle) {
        if (baseUrl) {
          for (const [fileName, chunkOrAsset] of Object.entries(bundle)) {
            if (chunkOrAsset.type === 'asset' && fileName.endsWith('.d.ts')) {
              const inputFilePath = path.join(baseUrl, chunkOrAsset.fileName)
              const outputFilePath = path.join(options.dir!, chunkOrAsset.fileName)

              const pathResolver = (source: string) => {
                const resolvedPath = resolvePathAlias({ source, baseUrl, currentFilePath: inputFilePath, aliasPaths })
                if (!resolvedPath) {
                  return null
                }

                const resolvedOutputPath = `${path.join(path.dirname(outputFilePath), resolvedPath)}.d.ts`
                if (!fs.existsSync(resolvedOutputPath)) {
                  console.log('no d.ts file', resolvedOutputPath, resolvedPath)
                  return null
                }

                console.log('d.ts file exist', resolvedOutputPath, resolvedPath)
                return resolvedPath
              }

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
