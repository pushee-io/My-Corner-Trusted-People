import {
  day2bJobRequestColumns,
  day2bProviderProfileColumns,
  day2bProviderResponseColumns,
  day2bProviderServiceColumns,
  day2bProviderTrustSignalColumns,
  type Day2BSupabaseReadTableName,
} from '@/lib/day2b-supabase-read-adapter';

export type Day2BReadPolicyContract = {
  table: Day2BSupabaseReadTableName;
  role: 'authenticated';
  operation: 'select';
  rlsRequired: true;
  allowedColumns: string[];
  usingExpression: string;
  deniedOperations: readonly ['insert', 'update', 'delete', 'upsert'];
};

const deniedWriteOperations = ['insert', 'update', 'delete', 'upsert'] as const;

const sensitiveReadColumnPattern =
  /phone_number|email|ghana.*post|ghana_post|gps|exact.*address|address_line|street_address|coordinates?|latitude|longitude|legal.*name|legal_name|challenge.*hash|challenge_hash|hash/i;

export const day2bReadTables = [
  'provider_profiles',
  'provider_services',
  'provider_trust_signals',
  'job_requests',
  'provider_responses',
] as const satisfies readonly Day2BSupabaseReadTableName[];

export const day2bReadPolicyContracts: Day2BReadPolicyContract[] = [
  {
    table: 'provider_profiles',
    role: 'authenticated',
    operation: 'select',
    rlsRequired: true,
    allowedColumns: columnsFrom(day2bProviderProfileColumns),
    usingExpression: 'accepting_requests = true',
    deniedOperations: deniedWriteOperations,
  },
  {
    table: 'provider_services',
    role: 'authenticated',
    operation: 'select',
    rlsRequired: true,
    allowedColumns: columnsFrom(day2bProviderServiceColumns),
    usingExpression: 'provider_id in visible provider_profiles for authenticated discovery reads',
    deniedOperations: deniedWriteOperations,
  },
  {
    table: 'provider_trust_signals',
    role: 'authenticated',
    operation: 'select',
    rlsRequired: true,
    allowedColumns: columnsFrom(day2bProviderTrustSignalColumns),
    usingExpression: 'provider_id in visible provider_profiles for authenticated discovery reads',
    deniedOperations: deniedWriteOperations,
  },
  {
    table: 'job_requests',
    role: 'authenticated',
    operation: 'select',
    rlsRequired: true,
    allowedColumns: columnsFrom(day2bJobRequestColumns),
    usingExpression: 'requester_id = auth.uid() or provider_id = auth.uid()',
    deniedOperations: deniedWriteOperations,
  },
  {
    table: 'provider_responses',
    role: 'authenticated',
    operation: 'select',
    rlsRequired: true,
    allowedColumns: columnsFrom(day2bProviderResponseColumns),
    usingExpression: 'job_request_id in visible job_requests for authenticated requester or provider reads',
    deniedOperations: deniedWriteOperations,
  },
];

export function hasPrivateDay2BReadColumn(column: string): boolean {
  return sensitiveReadColumnPattern.test(column);
}

export function getDay2BReadPolicyContract(table: Day2BSupabaseReadTableName): Day2BReadPolicyContract {
  const contract = day2bReadPolicyContracts.find((item) => item.table === table);

  if (!contract) {
    throw new Error(`Missing Day 2b read policy contract for ${table}.`);
  }

  return contract;
}

function columnsFrom(columnList: string): string[] {
  return columnList.split(',').map((column) => column.trim());
}
