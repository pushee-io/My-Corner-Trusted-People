import { readFileSync } from 'fs';

const bottomNavigationSource = readFileSync('src/components/BottomNavigation.tsx', 'utf8');
const screenSource = readFileSync('src/components/Screen.tsx', 'utf8');
const welcomeSource = readFileSync('app/index.tsx', 'utf8');
const signInSource = readFileSync('app/sign-in.tsx', 'utf8');

const expectedTabs = [
  { label: 'Home', href: '/home', match: ['/home', '/neighborhood', '/provider'] },
  { label: 'Hire', href: '/hire/categories', match: ['/hire'] },
  { label: 'Search', href: '/search', match: ['/search'] },
  { label: 'Community', href: '/community', match: ['/community', '/groups', '/agency-broadcasts'] },
  { label: 'Market', href: '/marketplace', match: ['/marketplace'] },
  { label: 'Settings', href: '/settings', match: ['/settings'] },
];

describe('Day 20F bottom navigation foundation', () => {
  it('defines the first shared bottom tabs for the core app features', () => {
    for (const tab of expectedTabs) {
      expect(bottomNavigationSource).toContain(`label: '${tab.label}'`);
      expect(bottomNavigationSource).toContain(`href: '${tab.href}'`);

      for (const route of tab.match) {
        expect(bottomNavigationSource).toContain(`'${route}'`);
      }
    }
  });

  it('marks tabs as accessible and selected from nested feature routes', () => {
    expect(bottomNavigationSource).toContain('accessibilityRole="tablist"');
    expect(bottomNavigationSource).toContain('accessibilityRole="tab"');
    expect(bottomNavigationSource).toContain('accessibilityState={{ selected }}');
    expect(bottomNavigationSource).toContain('pathname.startsWith(`${route}/`)');
  });

  it('mounts the bottom navigation from the shared Screen shell by default', () => {
    expect(screenSource).toContain("import { BottomNavigation } from '@/components/BottomNavigation'");
    expect(screenSource).toContain('showBottomNavigation = true');
    expect(screenSource).toContain('showBottomNavigation ? <BottomNavigation /> : null');
  });

  it('keeps welcome and sign-in outside the tab shell', () => {
    expect(welcomeSource).toContain('showBottomNavigation={false}');
    expect(signInSource).toContain('showBottomNavigation={false}');
  });

  it('does not add repository imports, Supabase config, or write actions to the navigation component', () => {
    expect(bottomNavigationSource).not.toContain('@/lib/repository');
    expect(bottomNavigationSource).not.toContain('@/lib/day2b-live-repository');
    expect(bottomNavigationSource).not.toContain('@/lib/community-repository');
    expect(bottomNavigationSource).not.toContain('supabase');
    expect(bottomNavigationSource).not.toContain('createJobRequest');
    expect(bottomNavigationSource).not.toContain('createNeighborhoodFeedPost');
    expect(bottomNavigationSource).not.toContain('createMarketplaceListing');
  });
});
