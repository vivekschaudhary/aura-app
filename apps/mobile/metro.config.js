// Metro configuration for Expo / React Native in a pnpm monorepo.
//
// 1. Enables package-exports resolution (modern ESM packages like
//    superjson → copy-anything).
// 2. Watches the workspace root so changes in packages/* hot-reload.
// 3. Pins react, react-native, and react-dom resolution to apps/mobile's
//    node_modules so phantom workspace-root copies (the `next` dep at
//    root for Vercel framework-detection brings react + react-dom) do
//    not cause "two copies of React" errors at runtime (ReactCurrentOwner
//    undefined, etc).
//
// Reference: https://docs.expo.dev/guides/monorepos/

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch workspace root for package hot-reload.
config.watchFolders = [workspaceRoot];

// Limit module resolution to these two paths only (no hierarchical lookup
// scanning the file system above us — important so Metro can't accidentally
// pick up the `next`-brought react-dom at root).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// Force single-copy resolution for React + RN. Even when workspace packages
// transitively `import 'react'`, this alias makes them all resolve to
// apps/mobile's symlinked copy.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Conditional `exports` field support (RN/Expo Metro 0.81+).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
