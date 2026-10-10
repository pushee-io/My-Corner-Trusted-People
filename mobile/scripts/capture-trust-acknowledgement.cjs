/* global __dirname */
// Render the real React Native component through react-native-web. These are
// component screenshots, not native Android/emulator acceptance evidence.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { transformFileSync } = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Native = require('react-native-web');

const output = path.resolve(process.argv[2] ?? '/tmp/trust-acknowledgement');
fs.mkdirSync(output, { recursive: true });

function loadSource(relative) {
  const result = transformFileSync(path.resolve(__dirname, '..', relative), {
    babelrc: false,
    configFile: false,
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
  });
  const module = { exports: {} };
  const sourceRequire = (name) => {
    if (name === 'react-native') return Native;
    if (name === '@/theme/tokens') return loadSource('src/theme/tokens.ts');
    return require(name);
  };
  new Function('require', 'module', 'exports', result.code)(sourceRequire, module, module.exports);
  return module.exports;
}

const { TrustAcknowledgement } = loadSource('src/components/TrustAcknowledgement.tsx');
const { tokens } = loadSource('src/theme/tokens.ts');
for (const checked of [false, true]) {
  const name = checked ? 'checked' : 'unchecked';
  function Evidence() {
    return React.createElement(
      Native.View,
      { style: { padding: tokens.spacing.lg, backgroundColor: tokens.color.background } },
      React.createElement(TrustAcknowledgement, { checked, onChange: () => {} }),
    );
  }
  Native.AppRegistry.registerComponent(`Acknowledgement-${name}`, () => Evidence);
  const { element, getStyleElement } = Native.AppRegistry.getApplication(`Acknowledgement-${name}`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderToStaticMarkup(getStyleElement())}<style>html,body{margin:0;background:${tokens.color.background}}</style></head><body>${renderToStaticMarkup(element)}</body></html>`;
  const file = path.join(output, `acknowledgement-${name}.html`);
  fs.writeFileSync(file, html);
  if (!process.argv.includes('--html-only')) {
    execFileSync(
      process.env.CHROME_BIN ?? 'google-chrome',
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=2',
        '--window-size=390,140',
        `--screenshot=${path.join(output, `acknowledgement-${name}.png`)}`,
        pathToFileURL(file).href,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
  }
  console.log(`Rendered acknowledgement: ${name}`);
}
