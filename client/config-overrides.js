const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const BASE_URL_PLACEHOLDER = 'BASE_URL_PLACEHOLDER';

const replaceInFile = (file, search, replace) => {
  fs.readFile(file, 'utf8', (readError, data) => {
    if (readError) {
      throw new Error(`${readError}`);
    }
    const res = data.replaceAll(search, replace);
    fs.writeFile(file, res, 'utf8', (writeError) => {
      if (writeError) {
        throw new Error(`${writeError}`);
      }
    });
  });
};

const replaceBaseUrl = (compiler) => {
  compiler.hooks.assetEmitted.tap('ReplaceBaseUrlPlaceholder', (file, info) => {
    if (info.content.indexOf(BASE_URL_PLACEHOLDER) >= 0) {
      if (/\.css$/.exec(info.targetPath)) {
        // For CSS 'url(...)' import we can use relative import
        const relPath = path
          .relative(path.dirname(info.targetPath), info.outputPath)
          .replace(/\\/g, '/');
        replaceInFile(info.targetPath, BASE_URL_PLACEHOLDER, `${relPath}/`);
      } else if (/\.js$/.exec(info.targetPath)) {
        // For JS 'import ... from "some-asset"' we can get the variable injected in the window object
        // eslint-disable-next-line no-template-curly-in-string
        replaceInFile(info.targetPath, `"${BASE_URL_PLACEHOLDER}"`, '`${window.BASE_URL}/`');
      } else if (/index\.html$/.exec(info.targetPath)) {
        // For the main html file, we set a placeholder for sails to inject the correct value as runtime
        replaceInFile(info.targetPath, BASE_URL_PLACEHOLDER, '<%= BASE_URL %>');
      }
    }
  });
};

module.exports = function override(config, env) {
  // Polyfille node-core dla zależności @gravity-ui/markdown-editor (@diplodoc/transform)
  // — webpack 5 nie dostarcza ich domyślnie.
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    process: require.resolve('process/browser.js'),
    buffer: require.resolve('buffer/'),
    path: require.resolve('path-browserify'),
    util: require.resolve('util/'),
    fs: false,
    os: false,
    crypto: false,
    stream: false,
    zlib: false,
    http: false,
    https: false,
    url: false,
    assert: false,
    net: false,
    tls: false,
    child_process: false,
    vm: false,
  };
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  // Wyłącz "fullySpecified" dla modułów ESM (gravity-ui / prosemirror / lezer),
  // inaczej webpack 5 wymaga rozszerzeń przy importach i wywala build.
  config.module = config.module || { rules: [] };
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: { fullySpecified: false },
  });

  // Szybki build dla środowiska DEV (OPDEV_FAST=1): bez minifikacji (terser to
  // największy konsument RAM/CPU) — mieści się w 4 GB RAM VM podmana i buduje
  // znacznie szybciej. Produkcyjne buildy (bez flagi) pozostają zminifikowane.
  if (process.env.OPDEV_FAST === '1') {
    config.optimization = config.optimization || {};
    config.optimization.minimize = false;
  }

  if (env === 'production') {
    const plugins = config.plugins.map((plugin) => {
      if (plugin.constructor.name === 'InterpolateHtmlPlugin') {
        const newPlugin = plugin;
        newPlugin.replacements.PUBLIC_URL = BASE_URL_PLACEHOLDER;
        return newPlugin;
      }
      return plugin;
    });
    return {
      ...config,
      output: { ...config.output, publicPath: BASE_URL_PLACEHOLDER },
      plugins: [...plugins, { apply: replaceBaseUrl }],
    };
  }
  return config;
};
