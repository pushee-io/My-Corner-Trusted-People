/* global __dirname */
// Test-only React Native Web rendering of the actual Home screen/components.
// Never imported by the app. No account, network data, native or device claims.
const fs = require('node:fs');
const { Buffer } = require('node:buffer');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { transformSync } = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Native = require('react-native-web');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.argv[2] ?? '/tmp/home-dashboard');
fs.mkdirSync(output, { recursive: true });
const h = React.createElement;
const glyphs = require('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json');
const font = fs
  .readFileSync(require.resolve('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'))
  .toString('base64');
const artwork = fs.readFileSync(path.join(root, 'assets/navigation/MyCornerNavigation.ttf')).toString('base64');
const post = {
  id: 'fixture-post',
  authorId: 'fixture-author',
  authorName: 'Ama K.',
  body: 'Our neighborhood cleanup starts at 8 AM on Saturday. Bring gloves if you have them. Everyone is welcome to join us at the community garden.',
  createdAt: '2026-10-10T08:00:00Z',
  likeCount: 4,
  comments: [{ id: 'fixture-comment' }],
  likedByMe: false,
};
const illustration = (fill) =>
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="110"><rect width="180" height="110" fill="#f2f3ef"/><rect x="25" y="30" width="130" height="55" rx="12" fill="' +
      fill +
      '"/><path d="M35 85v15m110-15v15" stroke="#35483f" stroke-width="6"/></svg>',
  ).toString('base64');
const listings = ['Garden bench', 'Side table', 'Reading chair'].map((title, i) => ({
  id: 'fixture-' + i,
  title,
  priceGhs: [180, 90, 220][i],
  imageUrl: illustration(['#98ad9c', '#b9a588', '#87a5ab'][i]),
}));
for (const scenario of [
  { name: 'phone', width: 390, height: 844 },
  { name: 'compact', width: 320, height: 760 },
  { name: 'tablet', width: 840, height: 1100 },
  { name: 'large-text', width: 390, height: 1100, scale: 1.6 },
  { name: 'empty', width: 390, height: 844, empty: true },
  { name: 'error', width: 390, height: 844, error: true },
  { name: 'ask-phone', width: 390, height: 844, ask: true },
  { name: 'ask-compact', width: 320, height: 900, ask: true },
  { name: 'ask-large-text', width: 390, height: 1200, scale: 1.6, ask: true },
  { name: 'ai-thinking', width: 390, height: 430, motion: 'thinking', character: 'older-man' },
  { name: 'ai-answer', width: 390, height: 430, motion: 'answer', character: 'young-man' },
  { name: 'ai-attention', width: 390, height: 430, motion: 'attention', character: 'woman-purple' },
]) {
  const cache = new Map();
  function resource(load) {
    let data;
    if (load === 'getCurrentCapabilities') data = { community: true, neighborhoodId: 'fixture-area' };
    else if (load === 'loadVerifiedNeighborhood') data = { name: 'East Legon', city: 'Accra' };
    else if (load === 'loadAskContext') data = { id: 'fixture-area', name: 'East Legon' };
    else if (load === 'loadAskQuota') data = undefined;
    else if (load === 'loadUnread') data = { unread: 3 };
    else if (load === 'loadHomeNotificationCount') data = 2;
    else if (load === 'loadHomeFeed') data = scenario.empty ? {} : { post };
    else if (load === 'loadHomeMarketplace') data = scenario.empty ? [] : listings;
    else if (load === 'loadHomeBroadcast')
      data = scenario.empty
        ? undefined
        : {
            id: 'fixture-broadcast',
            agencyName: 'Community Services · test fixture',
            title: 'Scheduled maintenance',
            body: 'Routine maintenance on Tuesday. Please check the full notice for times.',
          };
    else
      data = {
        requests: Array.from({ length: 28 }, (_, i) => ({
          id: String(i),
          status: 'Submitted',
          createdAt: '2026-01-01',
          statusTimeline: [],
        })),
        providers: {},
      };
    const failed = scenario.error && ['loadHomeFeed', 'loadHomeMarketplace', 'loadHomeBroadcast'].includes(load);
    return {
      data: failed ? undefined : data,
      error: failed ? 'Fixture offline state' : undefined,
      loading: false,
      refresh: () => {},
    };
  }
  function loadSource(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
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
    function sourceRequire(name) {
      if (name === 'react-native')
        return {
          ...Native,
          useWindowDimensions: () => ({
            width: scenario.width,
            height: scenario.height,
            fontScale: scenario.scale ?? 1,
          }),
          StyleSheet: {
            ...Native.StyleSheet,
            create: (styles) => {
              if (scenario.scale)
                for (const style of Object.values(styles))
                  for (const key of ['fontSize', 'lineHeight'])
                    if (typeof style[key] === 'number') style[key] *= scenario.scale;
              return Native.StyleSheet.create(styles);
            },
          },
        };
      if (name === '@react-native-community/netinfo')
        return { useNetInfo: () => ({ isConnected: true, isInternetReachable: true }) };
      if (name === 'react-native-safe-area-context') return { SafeAreaView: Native.View };
      if (name === 'expo-router')
        return { usePathname: () => scenario.ask ? '/ask' : '/home', useLocalSearchParams: () => ({}), useFocusEffect: () => {}, router: { push: () => {}, navigate: () => {} } };
      if (name === '@expo/vector-icons')
        return {
          Ionicons: ({ name: icon, size, color }) =>
            h(
              Native.Text,
              { style: { fontFamily: 'Ionicons', fontSize: size, color } },
              String.fromCodePoint(glyphs[icon] ?? glyphs['ellipse-outline']),
            ),
        };
      if (name.endsWith('NavigationArtwork'))
        return {
          NavigationArtwork: ({ name: icon, size, color }) =>
            h(
              Native.Text,
              { style: { fontFamily: 'MyCornerNavigation', fontSize: size, color } },
              String.fromCodePoint(icon === 'hire' ? 0xe900 : 0xe901),
            ),
        };
      if (name.endsWith('WebSafeLink')) return { WebSafeLink: ({ children }) => children };
      if (name.endsWith('CollapsibleComments')) return { CommentsProvider: ({ children }) => children };
      if (name.endsWith('MediaAvatar'))
        return {
          MediaAvatar: ({ name: publicName, size }) =>
            h(
              Native.View,
              {
                style: {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: '#e8f0eb',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
              h(Native.Text, { style: { color: '#0e6b50' } }, publicName[0]),
            ),
        };
      if (name.endsWith('useAICharacter')) return {
        useAICharacter: () => ({
          character: loadSource('src/lib/ai-characters.ts').findAICharacter(scenario.character),
          selectCharacter: () => {},
        }),
      };
      if (name.endsWith('useProtectedResource')) return { useProtectedResource: resource };
      if (name.endsWith('useMessagingResource'))
        return { useMessagingResource: resource, usePrivateSessionKey: () => 'fixture' };
      if (name.endsWith('.png'))
        return {
          uri:
            'data:image/png;base64,' +
            fs.readFileSync(path.resolve(root, path.dirname(relative), name)).toString('base64'),
        };
      if (name === '@/lib/events-feature') return { isEventsClientEnabled: () => false };
      if (
        name.startsWith('@/lib/') &&
        !['@/lib/active-requests', '@/lib/navigation-layout', '@/lib/mock-data', '@/lib/ai-characters'].includes(name)
      )
        return new Proxy({}, { get: (_target, key) => (key === 'previewImage' ? () => undefined : key) });
      if (name.startsWith('@/') || name.startsWith('.')) {
        const local = name.startsWith('@/') ? 'src/' + name.slice(2) : path.join(path.dirname(relative), name);
        return loadSource(local + (fs.existsSync(path.join(root, local + '.tsx')) ? '.tsx' : '.ts'));
      }
      return require(name);
    }
    new Function('require', 'module', 'exports', result.code)(sourceRequire, module, module.exports);
    cache.set(relative, module.exports);
    return module.exports;
  }
  const Home = scenario.motion
    ? () => h(Native.View, { style: { padding: 16, backgroundColor: '#FAFBF9' } },
      h(loadSource('src/components/AICharacterExperience.tsx').AICharacterExperience, {
        character: loadSource('src/lib/ai-characters.ts').findAICharacter(scenario.character),
        selectCharacter: () => {}, state: scenario.motion,
      }))
    : loadSource(scenario.ask ? 'app/ask.tsx' : 'app/home.tsx').default;
  Native.AppRegistry.registerComponent('Home-' + scenario.name, () => Home);
  const { element, getStyleElement } = Native.AppRegistry.getApplication('Home-' + scenario.name);
  const markup = renderToStaticMarkup(element);
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    renderToStaticMarkup(getStyleElement()) +
    '<style>@font-face{font-family:Ionicons;src:url(data:font/ttf;base64,' +
    font +
    ')}@font-face{font-family:MyCornerNavigation;src:url(data:font/ttf;base64,' +
    artwork +
    ')}html,body{margin:0;height:100%;background:#FAFBF9}body>div{height:100%}</style></head><body>' +
    markup +
    '</body></html>';
  const file = path.join(output, 'home-' + scenario.name + '.html');
  fs.writeFileSync(file, html);
  const screenshot = path.join(output, 'home-' + scenario.name + '.png');
  execFileSync(
    process.env.CHROME_BIN ?? 'google-chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=1500',
      '--window-size=' + scenario.width + ',' + scenario.height,
      '--screenshot=' + screenshot,
      pathToFileURL(file).href,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'], timeout: 30000 },
  );
  console.log('HOME_SCREENSHOT ' + scenario.name + ' ' + fs.readFileSync(screenshot).toString('base64'));
}
fs.writeFileSync(
  path.join(output, 'evidence.json'),
  JSON.stringify(
    {
      renderer: 'Actual Home components through React Native Web with test-only fixtures',
      native: false,
      authenticatedData: false,
      scenarios: ['phone', 'compact', 'tablet', 'large-text', 'empty', 'error'],
    },
    null,
    2,
  ),
);
