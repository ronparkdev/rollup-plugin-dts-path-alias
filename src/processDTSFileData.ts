import * as ts from 'typescript'

export function processDTSFileData(data: string, pathResolver: (source: string) => string | null): string {
  const sourceFile = ts.createSourceFile('file.d.ts', data, ts.ScriptTarget.Latest, true)

  const modifies: { start: number; end: number; text: string }[] = []

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const source = node.moduleSpecifier.text
        const resolvedPath = pathResolver(source)
        if (resolvedPath) {
          modifies.push({
            start: node.moduleSpecifier.getStart(),
            end: node.moduleSpecifier.getEnd(),
            text: `'${resolvedPath}'`,
          })
        }
      }
    } else if (ts.isExportAssignment(node)) {
      if (node.expression && ts.isStringLiteral(node.expression)) {
        const source = node.expression.text
        const resolvedPath = pathResolver(source)
        if (resolvedPath) {
          modifies.push({
            start: node.expression.getStart(),
            end: node.expression.getEnd(),
            text: `'${resolvedPath}'`,
          })
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  const modifiedData = modifies.reduceRight((data, modify) => {
    return `${data.slice(0, modify.start)}${modify.text}${data.slice(modify.end)}`
  }, data)

  return modifiedData
}
