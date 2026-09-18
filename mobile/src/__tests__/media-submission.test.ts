import { MediaSubmission } from '@/lib/media-submission';

function operations() {
  return {
    upload: jest.fn(async () => ['photo', 'video']),
    create: jest.fn(async (id: string) => ({ id, body: 'Original form text' })),
    attach: jest.fn(async () => {}),
    saving: jest.fn(),
  };
}

describe('product media submissions', () => {
  it('leaves the parent uncreated and editable after an upload failure', async () => {
    const submission = new MediaSubmission('stable-id', () => {});
    const op = operations();
    op.upload.mockRejectedValueOnce(new Error('offline'));
    await expect(submission.run(op)).rejects.toThrow('offline');
    expect(op.create).not.toHaveBeenCalled();
    expect(submission.locked).toBe(false);
    await expect(submission.run(op)).resolves.toMatchObject({ id: 'stable-id' });
    expect(op.attach).toHaveBeenCalledWith('stable-id', ['photo', 'video']);
  });

  it.each(['Feed', 'Hire', 'Groups', 'Events', 'Marketplace'])(
    '%s retries attachments without creating a second parent',
    async () => {
      const submission = new MediaSubmission('stable-id', () => {});
      const op = operations();
      op.attach.mockRejectedValueOnce(new Error('connection lost'));
      await expect(submission.run(op)).rejects.toThrow('connection lost');
      expect(submission.locked).toBe(true);
      await expect(submission.run(op)).resolves.toMatchObject({ body: 'Original form text' });
      expect(op.create).toHaveBeenCalledTimes(1);
      expect(op.attach).toHaveBeenCalledTimes(2);
      expect(await submission.run(op)).toBeUndefined();
      expect(op.create).toHaveBeenCalledTimes(1);
    },
  );

  it('reconciles a lost create response using the original ID and form values', async () => {
    const submission = new MediaSubmission('stable-id', () => {});
    const first = operations();
    first.create.mockRejectedValueOnce(new Error('response lost'));
    await expect(submission.run(first)).rejects.toThrow('response lost');
    const retry = operations();
    retry.create.mockResolvedValue({ id: 'wrong-new-id', body: 'Changed text' });
    await expect(submission.run(retry)).resolves.toEqual({ id: 'stable-id', body: 'Original form text' });
    expect(first.create.mock.calls).toEqual([['stable-id'], ['stable-id']]);
    expect(retry.create).not.toHaveBeenCalled();
  });

  it('accepts only one rapid submission and returns one navigation result', async () => {
    const submission = new MediaSubmission('stable-id', () => {});
    const op = operations();
    const results = await Promise.all([submission.run(op), submission.run(op), submission.run(op)]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(op.create).toHaveBeenCalledTimes(1);
    expect(op.attach).toHaveBeenCalledTimes(1);
  });

  it.each(['upload', 'create'] as const)(
    'does not attach media after an account or route changes during %s',
    async (phase) => {
      let current = true;
      const submission = new MediaSubmission('stable-id', () => {
        if (!current) throw new Error('account changed');
      });
      const op = operations();
      if (phase === 'upload')
        op.upload.mockImplementation(async () => {
          current = false;
          return ['photo'];
        });
      else
        op.create.mockImplementation(async (id) => {
          current = false;
          return { id, body: 'Original form text' };
        });
      await expect(submission.run(op)).rejects.toThrow('account changed');
      expect(op.attach).not.toHaveBeenCalled();
    },
  );
});
