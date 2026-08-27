import fs from 'node:fs';

const migrationPath = '../supabase/migrations/20260827190000_marketplace_moderator_queue.sql';

describe('Marketplace moderator queue', () => {
  const repository = fs.readFileSync('src/lib/marketplace-moderation-repository.ts', 'utf8');
  const contracts = fs.readFileSync('src/types/contracts.ts', 'utf8');
  const queueScreen = fs.readFileSync('app/marketplace/moderation/index.tsx', 'utf8');
  const reportScreen = fs.readFileSync('app/marketplace/moderation/[reportId].tsx', 'utf8');
  const signInScreen = fs.readFileSync('app/sign-in.tsx', 'utf8');
  const migration = fs.readFileSync(migrationPath, 'utf8');

  it('provides a dedicated filterable Marketplace report queue', () => {
    expect(queueScreen).toContain('listMarketplaceModerationQueue(filter)');
    expect(queueScreen).toContain("{ label: 'Open', value: 'open' }");
    expect(queueScreen).toContain("{ label: 'Reviewing', value: 'reviewing' }");
    expect(queueScreen).toContain("{ label: 'Resolved', value: 'resolved' }");
    expect(signInScreen).toContain("router.replace('/marketplace/moderation')");
  });

  it('requires a controlled reason and confirmation for every action', () => {
    expect(contracts).toContain("MarketplaceModerationDecision = 'approve' | 'flag' | 'block'");
    expect(repository).toContain('validateMarketplaceModerationAction(input)');
    expect(reportScreen).toContain('Review decision');
    expect(reportScreen).toContain('Confirm decision');
    expect(reportScreen).toContain('This does not ban the seller.');
  });

  it('uses a moderator-only database transaction for approve, flag, and block', () => {
    expect(migration).toContain('security definer');
    expect(migration).toContain('if actor_profile_id is null or not public.is_admin_or_moderator()');
    expect(migration).toContain("decision not in ('approve', 'flag', 'block')");
    expect(migration).toContain("when 'approve' then 'clean'::public.moderation_status");
    expect(migration).toContain("when 'flag' then 'flagged'::public.moderation_status");
    expect(migration).toContain("else 'blocked'::public.moderation_status");
    expect(migration).toContain("raise exception 'resolved reports cannot be changed'");
  });

  it('keeps an append-only audit trail with prior and resulting status', () => {
    expect(migration).toContain("'marketplace_report_reviewed'");
    expect(migration).toContain("'previous_status', listing_row.moderation_status");
    expect(migration).toContain("'resulting_status', next_content_status");
    expect(migration).toContain('revoke insert, update, delete on public.moderation_cases, public.audit_events');
    expect(reportScreen).toContain('Audit history');
  });
});
