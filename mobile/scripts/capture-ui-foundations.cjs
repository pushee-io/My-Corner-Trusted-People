/* global __dirname */
// Actual shared components rendered with RN Web. Test fixtures only; NOT native
// emulator, full-screen app, keyboard, auth or live-data acceptance evidence.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { transformSync } = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Native = require('react-native-web');
const root = path.resolve(__dirname, '..', '..');
const output = path.resolve(process.argv[2] ?? '/tmp/ui-foundations');
const baseline = '5071729d51dd00e6fe438c3d34b8a3be2f2f40fc';
fs.mkdirSync(output, { recursive: true });

for (const revision of ['before', 'after']) {
  const cache = new Map();
  function loadSource(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const source =
      revision === 'before'
        ? execFileSync('git', ['show', `${baseline}:mobile/${relative}`], { cwd: root, encoding: 'utf8' })
        : fs.readFileSync(path.join(root, 'mobile', relative), 'utf8');
    const result = transformSync(source, {
      filename: relative,
      babelrc: false,
      configFile: false,
      presets: [
        [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
        require.resolve('@babel/preset-typescript'),
        [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
      ],
    });
    const module = { exports: {} };
    const sourceRequire = (name) => {
      if (name === 'react-native') return Native;
      if (name === '@react-native-community/netinfo') {
        return { useNetInfo: () => ({ isConnected: false, isInternetReachable: false }) };
      }
      if (name.startsWith('@/') || name.startsWith('.')) {
        const local = name.startsWith('@/') ? `src/${name.slice(2)}` : path.join(path.dirname(relative), name);
        const suffix = local.startsWith('src/components/') ? '.tsx' : '.ts';
        return loadSource(`${local}${suffix}`);
      }
      return require(name);
    };
    new Function('require', 'module', 'exports', result.code)(sourceRequire, module, module.exports);
    cache.set(relative, module.exports);
    return module.exports;
  }
  const { ActionPill } = loadSource('src/components/ActionPill.tsx');
  const { EmptyState, ErrorState, LoadingState, SuccessState, OfflineBanner } = loadSource(
    'src/components/StateBlocks.tsx',
  );
  const { TrustAcknowledgement } = loadSource('src/components/TrustAcknowledgement.tsx');
  const { tokens } = loadSource('src/theme/tokens.ts');
  const h = React.createElement;
  function Evidence() {
    return h(
      Native.View,
      { style: { padding: 16, gap: 16, backgroundColor: tokens.color.background } },
      h(
        Native.Text,
        { style: { fontSize: 18, lineHeight: 26, fontWeight: '700', color: tokens.color.textPrimary } },
        'Shared foundations — component fixture',
      ),
      h(
        Native.Text,
        { style: { fontSize: 14, color: tokens.color.textSecondary } },
        'React Native Web • sample states • no live account data',
      ),
      h(
        Native.View,
        { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } },
        h(ActionPill, { label: 'Search', onPress: () => {} }),
        h(ActionPill, { label: 'Continue', primary: true, onPress: () => {} }),
        h(ActionPill, { label: 'Unavailable', primary: true, disabled: true, onPress: () => {} }),
      ),
      h(ActionPill, { label: 'A longer action label should wrap comfortably on a small screen', onPress: () => {} }),
      h(LoadingState, { title: 'Loading neighborhood updates' }),
      h(EmptyState, { title: 'No active requests', body: 'Choose Hire help to get started.' }),
      h(ErrorState, { title: 'Search unavailable', body: 'Check your connection and try again.', onRetry: () => {} }),
      h(SuccessState, { title: 'Review before sending', body: 'Check the request details before submitting.' }),
      h(OfflineBanner, { onRetry: () => {} }),
      h(TrustAcknowledgement, { checked: false, onChange: () => {} }),
      h(TrustAcknowledgement, { checked: true, onChange: () => {} }),
    );
  }
  Native.AppRegistry.registerComponent(`Foundations-${revision}`, () => Evidence);
  const { element, getStyleElement } = Native.AppRegistry.getApplication(`Foundations-${revision}`);
  const markup = renderToStaticMarkup(element);
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderToStaticMarkup(getStyleElement())}<style>html,body{margin:0;background:${tokens.color.background}}</style></head><body>${markup}</body></html>`;
  const file = path.join(output, `foundations-${revision}.html`);
  fs.writeFileSync(file, html);
  for (const width of [320, 390, 840]) {
    if (!process.argv.includes('--html-only')) {
      execFileSync(
        process.env.CHROME_BIN ?? 'google-chrome',
        [
          '--headless=new',
          '--no-sandbox',
          '--disable-gpu',
          '--hide-scrollbars',
          '--force-device-scale-factor=1',
          `--window-size=${width},1560`,
          `--screenshot=${path.join(output, `foundations-${revision}-${width}.png`)}`,
          pathToFileURL(file).href,
        ],
        { stdio: ['ignore', 'ignore', 'pipe'] },
      );
    }
  }
  console.log(`Rendered ${revision} shared components (baseline ${baseline})`);
}
fs.writeFileSync(
  path.join(output, 'evidence.json'),
  JSON.stringify(
    {
      baseline,
      head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      renderer: 'React Native Web server rendering + headless Chrome',
      nativeEmulator: false,
      liveData: false,
      widths: [320, 390, 840],
    },
    null,
    2,
  ),
);
