import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = process.env.APP_URL ?? 'http://127.0.0.1:8081';
const outputDir = process.env.USABILITY_OUTPUT_DIR ?? 'usability-artifacts';
await mkdir(outputDir, { recursive: true });

function safetyRow(overrides = {}) {
  return {
    job_request_id: 'job-safety-usability-test',
    state: 'awaiting_location',
    viewer_role: 'requester',
    can_view_exact_location: false,
    private_latitude: null,
    private_longitude: null,
    private_location_label: null,
    location_shared_at: null,
    provider_arrived_at: null,
    arrival_confirmed_at: null,
    active_at: null,
    code_expires_at: null,
    code_attempt_count: 0,
    requester_completed_at: null,
    provider_completed_at: null,
    completed_at: null,
    ...overrides,
  };
}

async function mockSafetyRpc(page, initialRow) {
  let row = { ...initialRow };

  await page.route('https://example.supabase.co/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    const rpc = pathname.split('/').at(-1);

    if (rpc === 'get_job_safety_session') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([row]) });
      return;
    }

    if (rpc === 'set_job_safety_location') {
      row = safetyRow({
        state: 'location_shared',
        viewer_role: 'requester',
        can_view_exact_location: true,
        private_latitude: 5.65045,
        private_longitude: -0.15412,
        private_location_label: 'Green gate beside the pharmacy',
        location_shared_at: new Date().toISOString(),
        code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_request_id: row.job_request_id,
          state: 'location_shared',
          one_time_code: '483921',
          code_expires_at: row.code_expires_at,
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
  });
}

async function auditLayout(page, scenario) {
  const metrics = await page.evaluate(() => {
    const interactive = Array.from(document.querySelectorAll('[role="button"], [role="checkbox"], input'))
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          role: element.getAttribute('role') ?? element.tagName.toLowerCase(),
          label:
            element.getAttribute('aria-label') ??
            element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100) ??
            '',
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      });

    const overlaps = [];
    for (let first = 0; first < interactive.length; first += 1) {
      for (let second = first + 1; second < interactive.length; second += 1) {
        const a = interactive[first];
        const b = interactive[second];
        const area =
          Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
          Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        if (area > 4) overlaps.push({ first: a.label, second: b.label, area });
      }
    }

    return {
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      interactive,
      undersized: interactive.filter((item) => item.width < 48 || item.height < 48),
      overlaps,
    };
  });

  const failures = [];
  if (metrics.scrollWidth > metrics.viewportWidth + 1) {
    failures.push(`horizontal overflow: ${metrics.scrollWidth}px content in ${metrics.viewportWidth}px viewport`);
  }
  if (metrics.undersized.length) failures.push(`undersized controls: ${JSON.stringify(metrics.undersized)}`);
  if (metrics.overlaps.length) failures.push(`overlapping controls: ${JSON.stringify(metrics.overlaps)}`);

  return { scenario, ...metrics, failures };
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const reports = [];
let activePage;
let activeScenario = 'not-started';

function observePage(page, scenario) {
  page.on('console', (message) => console.log(`browser[${scenario}] ${message.type()}: ${message.text()}`));
  page.on('pageerror', (error) => console.error(`browser[${scenario}] pageerror: ${error.message}`));
}

try {
  const phone = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
  activePage = phone;
  activeScenario = 'compact-requester-pin-release';
  observePage(phone, activeScenario);
  await mockSafetyRpc(phone, safetyRow());
  await phone.goto(`${baseUrl}/hire/request/safety-session?requestId=job-safety-usability-test`, {
    waitUntil: 'networkidle',
  });
  console.log(`browser[compact-requester-pin-release] body: ${(await phone.locator('body').innerText()).slice(0, 1500)}`);
  await phone.getByText('Private service pin').waitFor();
  await phone.getByLabel('Private location description').fill('Green gate beside the pharmacy');
  await phone.getByRole('checkbox').click();
  await phone.getByRole('button', { name: 'Release pin to provider' }).click();
  await phone.getByText('Your one-time arrival code').waitFor();
  await phone.getByText('4 8 3 9 2 1').waitFor();
  await phone.screenshot({ path: `${outputDir}/compact-requester-pin-release.png`, fullPage: true });
  reports.push(await auditLayout(phone, 'compact-requester-pin-release'));

  const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
  activePage = tablet;
  activeScenario = 'tablet-provider-code-entry';
  observePage(tablet, activeScenario);
  await mockSafetyRpc(
    tablet,
    safetyRow({
      state: 'arrival_confirmed',
      viewer_role: 'provider',
      can_view_exact_location: true,
      private_latitude: 5.65045,
      private_longitude: -0.15412,
      private_location_label: 'Green gate beside the pharmacy',
      location_shared_at: new Date().toISOString(),
      provider_arrived_at: new Date().toISOString(),
      arrival_confirmed_at: new Date().toISOString(),
      code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
  );
  await tablet.goto(`${baseUrl}/hire/request/safety-session?requestId=job-safety-usability-test`, {
    waitUntil: 'networkidle',
  });
  console.log(`browser[tablet-provider-code-entry] body: ${(await tablet.locator('body').innerText()).slice(0, 1500)}`);
  await tablet.getByText('Enter requester code').waitFor();
  await tablet.getByText('Never request it by message or phone.').waitFor();
  await tablet.getByLabel('Six-digit code').fill('483921');
  await tablet.screenshot({ path: `${outputDir}/tablet-provider-code-entry.png`, fullPage: true });
  reports.push(await auditLayout(tablet, 'tablet-provider-code-entry'));
} catch (error) {
  if (activePage) {
    await activePage.screenshot({ path: `${outputDir}/diagnostic-${activeScenario}.png`, fullPage: true });
    await writeFile(
      `${outputDir}/diagnostic-${activeScenario}.txt`,
      await activePage.locator('body').innerText().catch(() => String(error)),
    );
  }
  throw error;
} finally {
  await browser.close();
}

await writeFile(`${outputDir}/report.json`, JSON.stringify(reports, null, 2));

const failures = reports.flatMap((report) => report.failures.map((failure) => `${report.scenario}: ${failure}`));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

for (const report of reports) {
  console.log(
    `${report.scenario}: PASS; ${report.interactive.length} interactive controls, no overflow, undersized controls, or overlaps`,
  );
}
