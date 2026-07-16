import type { UserRole } from '@/types/contracts';

export type TestSession = {
  id: string;
  name: string;
  role: UserRole;
  providerId?: string;
  neighborhood: string;
};

export const testRequester: TestSession = {
  id: 'usr-requester-01',
  name: 'Akosua Mensah',
  role: 'requester',
  neighborhood: 'East Legon',
};

export const testProvider: TestSession = {
  id: 'usr-provider-01',
  name: 'Kwame PipeCare',
  role: 'provider',
  providerId: 'prov-01',
  neighborhood: 'East Legon',
};
