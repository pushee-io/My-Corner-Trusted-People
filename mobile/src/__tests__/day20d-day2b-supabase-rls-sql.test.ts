import { readFileSync } from 'fs';
import path from 'path';
import {
  day2bJobRequestColumns,
  day2bProviderProfileColumns,
  day2bProviderResponseColumns,
  day2bProviderServiceColumns,
  day2bProviderTrustSignalColumns,
} from '@/lib/day2b-supabase-read-adapter';
import {
  day2bReadPolicyContracts,
  day2bReadTables,
  hasPrivateDay2BReadColumn,
} from '@/lib/day2b-supabase-read-policy';

const migrationPath = path.resolve(
  __dirname,
  '../../..',
  'supabase/migrations/20260729005000_day2b_live_read_rls.sql',
);
const migrationSql = readFileSync(migrationPath, 'utf8');

const expectedColumnsByTable = {
  provider_profiles: columnsFrom(day2bProviderProfileColumns),
  provider_services: columnsFrom(day2bProviderServiceColumns),
  provider_trust_signals: columnsFrom(day2bProviderTrustSignalColumns),
  job_requests: columnsFrom(day2bJobRequestColumns),
  provider_responses: columnsFrom(day2bProviderResponseColumns),
};

function columnsFrom(columnList: string): string[] {
  return columnList.split(',').map((column) => column.trim());
}

function grantColumnsFor(table: string): string[] {
  const match = migrationSql.match(
    new RegExp(`grant select \\(([\\s\\S]*?)\\) on table public\\.${table} to authenticated;`, 'i'),
  );
  if (!match?.[1]) throw new Error(`Missing column grant for ${table}.`);

  return match[1]
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean);
}

describe('Day 20D Day 2b Supabase RLS SQL migration', () => {
  it('creates the migration in the standard Supabase migrations directory', () => {
    expect(migrationPath).toMatch(/supabase\/migrations\/20260729005000_day2b_live_read_rls\.sql$/);
  });

  it('enables RLS for every Day 2b live read table', () => {
    for (const table of day2bReadTables) {
      expect(migrationSql).toContain(`alter table if exists public.${table} enable row level security;`);
    }
  });

  it('revokes broad anon and authenticated access before granting narrow reads', () => {
    for (const table of day2bReadTables) {
      expect(migrationSql).toContain(`revoke all on table public.${table} from anon, authenticated;`);
    }
  });

  it('grants authenticated SELECT only on the adapter-approved columns', () => {
    for (const table of day2bReadTables) {
      expect(grantColumnsFor(table)).toEqual(expectedColumnsByTable[table]);
    }
  });

  it('does not grant private Day 2b columns or wildcard table selects', () => {
    expect(migrationSql.toLowerCase()).not.toMatch(/grant\s+(insert|update|delete|all)\b/);
    expect(migrationSql.toLowerCase()).not.toMatch(/grant\s+select\s+on\s+table/);

    for (const table of day2bReadTables) {
      for (const column of grantColumnsFor(table)) {
        expect(column).not.toBe('*');
        expect(hasPrivateDay2BReadColumn(column)).toBe(false);
      }
    }
  });

  it('creates authenticated SELECT policies for every Day 2b read table', () => {
    for (const contract of day2bReadPolicyContracts) {
      expect(migrationSql).toContain(`create policy day2b_${contract.table}_authenticated_read`);
      expect(migrationSql).toContain(`on public.${contract.table}`);
      expect(migrationSql).toContain('for select');
      expect(migrationSql).toContain('to authenticated');
    }
  });

  it('scopes provider discovery to accepting providers and request reads to authenticated participants', () => {
    expect(migrationSql).toContain('using (accepting_requests is true);');
    expect(migrationSql).toContain('visible_provider.accepting_requests is true');
    expect(migrationSql).toContain('visible_provider.id::text = provider_services.provider_id::text');
    expect(migrationSql).toContain('visible_provider.id::text = provider_trust_signals.provider_id::text');
    expect(migrationSql).toContain('requester_id::text = auth.uid()::text');
    expect(migrationSql).toContain('provider_id::text = auth.uid()::text');
    expect(migrationSql).toContain('visible_request.id::text = provider_responses.job_request_id::text');
    expect(migrationSql).toContain('from public.job_requests visible_request');
  });
});
