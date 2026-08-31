import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return collectTsxFiles(path);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [path] : [];
  });
}

describe('web-safe navigation migration', () => {
  it('keeps the Expo Link slot behind a platform boundary', () => {
    const source = readFileSync('src/components/WebSafeLink.tsx', 'utf8');

    expect(source).toContain("Platform.OS === 'web'");
    expect(source).toContain('cloneElement(children, { onPress })');
    expect(source).toContain('router.push(href)');
    expect(source).toContain('<Link asChild href={href}>');
  });

  it('routes active Link asChild call sites through WebSafeLink', () => {
    const sourceFiles = [...collectTsxFiles('app'), ...collectTsxFiles('src/components')];

    for (const path of sourceFiles) {
      if (path.endsWith('WebSafeLink.tsx')) continue;

      const source = readFileSync(path, 'utf8');
      if (!source.includes('asChild')) continue;

      expect(source).not.toContain('<Link');
      expect(source).not.toMatch(/import \{\s*Link(?:\s|,)/);
      expect(source).toContain('<WebSafeLink');
      expect(source).toContain("from '@/components/WebSafeLink'");
    }
  });
});
