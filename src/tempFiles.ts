import fs from 'fs'
import os from 'os'
import path from 'path'

import { v4 as uuidv4 } from 'uuid'

export const tempFiles = (fileMap: { [filePath: string]: string }) => {
  const basePath = path.join(fs.realpathSync(os.tmpdir()), uuidv4())

  Object.keys(fileMap).forEach(filePath => {
    const folderPath = path.join(basePath, path.dirname(filePath))
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(path.join(basePath, filePath), fileMap[filePath])
  })

  const cleanUpFunc = () => {
    try {
      fs.rmSync(basePath, { recursive: true })
    } catch {
      // ignore
    }
  }

  return [basePath, cleanUpFunc] as const
}
