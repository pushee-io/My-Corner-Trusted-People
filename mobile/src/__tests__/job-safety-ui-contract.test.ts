import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '../..');

describe('Job Safety Session UI contract', () => {
  it('routes requester and provider accepted jobs into the shared session', () => {
    const requesterStatus = readFileSync(join(root, 'app/hire/request/status.tsx'), 'utf8');
    const providerDetail = readFileSync(join(root, 'app/provider/request/[requestId].tsx'), 'utf8');

    expect(requesterStatus).toContain("pathname: '/hire/request/safety-session'");
    expect(requesterStatus).toContain('WebSafeLink');
    expect(providerDetail).toContain("['Submitted', 'Viewed'].includes(request.status)");
    expect(providerDetail).toContain("['Accepted', 'In progress', 'Completed'].includes(request.status)");
    expect(providerDetail).toContain("pathname: '/hire/request/safety-session'");
    expect(providerDetail).not.toContain("pathname: '/provider/request/status-update'");
  });

  it('removes direct provider in-progress and completed controls', () => {
    const providerStatus = readFileSync(join(root, 'app/provider/request/status-update.tsx'), 'utf8');

    expect(providerStatus).not.toContain('updateRequestStatus');
    expect(providerStatus).toContain('shared safety session');
    expect(providerStatus).toContain('WebSafeLink');
  });

  it('includes requester-controlled location, arrival, code, active, and completion actions', () => {
    const source = readFileSync(join(root, 'app/hire/request/safety-session.tsx'), 'utf8');

    expect(source).toContain('releaseJobSafetyLocation');
    expect(source).toContain('markJobSafetyArrived');
    expect(source).toContain('confirmJobSafetyArrival');
    expect(source).toContain('startJobSafetySession');
    expect(source).toContain('acknowledgeJobSafetyCompletion');
    expect(source).toContain('Two-party completion');
  });
});
