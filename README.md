# rollup-plugin-dts-path-alias

A Rollup plugin that resolves TypeScript path aliases and baseUrl configurations in `.d.ts` files by converting them into relative paths. This is particularly useful when building individual `.ts` files into corresponding `.js` and `.d.ts` files without bundling them into a single `.d.ts` file.

## Features

- Automatically resolves path aliases and baseUrl settings from your `tsconfig.json` to relative paths in `.d.ts` files.
- Supports monorepo environments.
- Designed to work with individual `.ts` file builds rather than a single bundled `.d.ts` file.

## Installation

Install the plugin via npm or yarn:

```bash
npm install rollup-plugin-dts-path-alias --save-dev
```

or

```bash
yarn add rollup-plugin-dts-path-alias --dev
```

## Usage

Add `rollup-plugin-dts-path-alias` to your Rollup configuration alongside a TypeScript plugin like `@rollup/plugin-typescript`:

```javascript
import typescript from '@rollup/plugin-typescript';
import dtsPathAlias from 'rollup-plugin-dts-path-alias';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    dtsPathAlias(),  // Apply the path alias plugin before generating .d.ts files
    typescript(),    // Compile TypeScript files to .js and .d.ts
  ],
};
```

### Important Note

This plugin is **not** designed to be used with `rollup-plugin-dts`, which bundles all TypeScript declaration files into a single `.d.ts` file. Instead, `rollup-plugin-dts-path-alias` works best when TypeScript files are compiled individually into `.js` and `.d.ts` files using plugins like `@rollup/plugin-typescript`.

## Options

### `cwd` (optional)

- **Type**: `string`
- **Default**: `process.cwd()`

The `cwd` option allows you to specify the current working directory from which the plugin will start searching for the `tsconfig.json` file. If not provided, the plugin defaults to the current working directory.

Example:

```javascript
dtsPathAlias({
  cwd: '/path/to/project',
})
```

## How It Works

This plugin automatically locates your `tsconfig.json` by starting from the provided `cwd` (or the current working directory if not specified) and moving up the directory tree. Once it finds `tsconfig.json`, it reads the `baseUrl` and `paths` configuration and rewrites import/export paths in `.d.ts` files to relative paths.

### Example

Given the following `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@utils/*": ["utils/*"]
    }
  }
}
```

If your `.d.ts` file contains:

```typescript
import { someFunction } from '@utils/someFunction';
```

After applying the plugin, it will be converted to:

```typescript
import { someFunction } from '../utils/someFunction';
```

This ensures that your `.d.ts` files are portable and can be correctly resolved in different environments.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request with improvements or bug fixes.

## License

This project is licensed under the MIT License.
