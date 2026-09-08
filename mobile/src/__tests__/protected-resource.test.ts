import { createProtectedResource } from '@/lib/protected-resource';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('account-scoped report data', () => {
  it('removes visible records and discards an in-flight response after logout or backgrounding', async () => {
    const pending = deferred<string[]>();
    const load = jest.fn().mockResolvedValueOnce(['moderator case']).mockReturnValueOnce(pending.promise);
    const publish = jest.fn();
    const resource = createProtectedResource(load, publish);
    await resource.refresh();
    expect(publish).toHaveBeenLastCalledWith({ data: ['moderator case'], loading: false });
    const reload = resource.refresh();
    resource.clear();
    pending.resolve(['private old-account case']);
    await reload;
    expect(publish).toHaveBeenLastCalledWith({ loading: false });
    expect(publish.mock.calls.flat()).not.toContainEqual({ data: ['private old-account case'], loading: false });
  });

  it('does not let a previous account overwrite a new account response', async () => {
    const previous = deferred<string[]>();
    const load = jest.fn().mockReturnValueOnce(previous.promise).mockResolvedValueOnce(['new account case']);
    const publish = jest.fn();
    const resource = createProtectedResource(load, publish);
    const first = resource.refresh();
    resource.clear();
    await resource.refresh();
    previous.resolve(['previous account case']);
    await first;
    expect(publish).toHaveBeenLastCalledWith({ data: ['new account case'], loading: false });
  });

  it('discards late errors and responses after the route unmounts', async () => {
    const pending = deferred<string[]>();
    const publish = jest.fn();
    const resource = createProtectedResource(() => pending.promise, publish);
    const first = resource.refresh();
    resource.dispose();
    pending.reject(new Error('private backend details'));
    await first;
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it('clears previous data when a refresh fails without exposing raw server errors', async () => {
    const load = jest.fn().mockResolvedValueOnce(['case']).mockRejectedValueOnce(new Error('private backend details'));
    const publish = jest.fn();
    const resource = createProtectedResource(load, publish);
    await resource.refresh();
    await resource.refresh();
    expect(publish.mock.calls.at(-1)?.[0]).toEqual({ loading: false, error: expect.any(String) });
    expect(JSON.stringify(publish.mock.calls)).not.toContain('private backend details');
  });
});
