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
  getDay2BReadPolicyContract,
  hasPrivateDay2BReadColumn,
} from '@/lib/day2b-supabase-read-policy';

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

describe('Day 20C Day 2b Supabase read policy contract', () => {
  it('covers every table used by the Day 2b Supabase read adapter', () => {
    expect(day2bReadPolicyContracts.map((contract) => contract.table).sort()).toEqual([...day2bReadTables].sort());
  });

  it('requires authenticated SELECT policies with RLS enabled for every Day 2b read table', () => {
    for (const contract of day2bReadPolicyContracts) {
      expect(contract.role).toBe('authenticated');
      expect(contract.operation).toBe('select');
      expect(contract.rlsRequired).toBe(true);
      expect(contract.usingExpression).toEqual(expect.any(String));
      expect(contract.usingExpression.length).toBeGreaterThan(0);
    }
  });

  it('keeps every Day 2b read table write-denied from the Expo live boundary', () => {
    for (const contract of day2bReadPolicyContracts) {
      expect(contract.deniedOperations).toEqual(['insert', 'update', 'delete', 'upsert']);
    }
  });

  it('matches the exact narrow columns used by the read adapter', () => {
    for (const table of day2bReadTables) {
      expect(getDay2BReadPolicyContract(table).allowedColumns).toEqual(expectedColumnsByTable[table]);
    }
  });

  it('never approves private Day 2b fields for Supabase read payloads', () => {
    const approvedColumns = day2bReadPolicyContracts.flatMap((contract) => contract.allowedColumns);

    expect(approvedColumns).not.toContain('*');
    for (const column of approvedColumns) {
      expect(hasPrivateDay2BReadColumn(column)).toBe(false);
    }
  });

  it('scopes request and response reads to authenticated requester or provider visibility', () => {
    expect(getDay2BReadPolicyContract('job_requests').usingExpression).toMatch(/requester_id.*auth\.uid\(\)/);
    expect(getDay2BReadPolicyContract('job_requests').usingExpression).toMatch(/provider_id.*auth\.uid\(\)/);
    expect(getDay2BReadPolicyContract('provider_responses').usingExpression).toMatch(/visible job_requests/);
  });
});
