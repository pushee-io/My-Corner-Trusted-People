/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
const { chromium } = require('playwright-core');
const output = path.resolve(process.argv[2]);
fs.mkdirSync(output, { recursive: true });
(async () => {
  const bundle = await build({
    entryPoints: [path.join(__dirname, 'character-motion-preview.tsx')],
    bundle: true,
    write: false,
    minify: true,
    platform: 'browser',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"', __DEV__: 'false' },
    alias: { 'react-native': 'react-native-web', '@': path.resolve(__dirname, '../src') },
    loader: { '.png': 'dataurl' },
    plugins: [
      {
        name: 'fixture-focus',
        setup(b) {
          b.onResolve({ filter: /^expo-router$/ }, () => ({ path: 'focus', namespace: 'fixture' }));
          b.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
            contents: 'import {useEffect} from "react"; export function useFocusEffect(fn){useEffect(fn,[fn])}',
            resolveDir: path.resolve(__dirname, '..'),
          }));
        },
      },
    ],
  });
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Corner character motion QA</title></head><body style="margin:0"><div id="root"></div><script>' +
    bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script') +
    '</script></body></html>';
  fs.writeFileSync(path.join(output, 'character-motion.html'), html);
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 660 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setContent(html);
    await page.getByText('Ebony', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(output, 'characters-welcome.png') });
    for (let i = 0; i < 32; i++) {
      await page.screenshot({ path: path.join(output, `motion-${String(i).padStart(3, '0')}.png`) });
      await page.waitForTimeout(120);
    }
    await page.getByRole('button', { name: 'answer', exact: true }).click();
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(output, 'characters-answer.png') });
    for (let i = 32; i < 48; i++) {
      await page.screenshot({ path: path.join(output, `motion-${String(i).padStart(3, '0')}.png`) });
      await page.waitForTimeout(120);
    }
    await page.getByRole('button', { name: 'surprised', exact: true }).click();
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(output, 'characters-surprised.png') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'thinking', exact: true }).click();
    await page.waitForTimeout(250);
    const first = await page.locator('[data-testid="character-art"]').first().screenshot();
    await page.waitForTimeout(500);
    const second = await page.locator('[data-testid="character-art"]').first().screenshot();
    if (!first.equals(second)) throw new Error('Reduce Motion must keep the character static');
    await page.screenshot({ path: path.join(output, 'characters-reduced-motion.png') });
    fs.writeFileSync(
      path.join(output, 'motion-evidence.json'),
      JSON.stringify(
        {
          source: 'Production React Native Web animation components',
          native: false,
          frames: 48,
          states: ['welcome', 'answer', 'surprised', 'thinking with Reduce Motion'],
          reducedMotionStatic: true,
          errors,
        },
        null,
        2,
      ),
    );
    if (errors.length) throw new Error(errors.join('\n'));
  } finally {
    await browser.close();
  }
})();
