/** One form keeps one parent identity until all attachments are acknowledged. */
export class MediaSubmission<T extends { id: string }> {
  private parent?: T;
  private save?: () => Promise<T>;
  private running = false;
  private complete = false;

  constructor(
    readonly clientId: string,
    private readonly assertCurrent: () => void,
  ) {}

  get locked() {
    return this.save !== undefined;
  }

  get busy() {
    return this.running;
  }

  async run(operations: {
    upload: () => Promise<string[]>;
    create: (clientId: string) => Promise<T>;
    attach: (parentId: string, assetIds: string[]) => Promise<void>;
    saving: () => void;
  }): Promise<T | undefined> {
    if (this.running || this.complete) return;
    this.running = true;
    try {
      this.assertCurrent();
      const ids = await operations.upload();
      this.assertCurrent();
      if (!this.parent) {
        // Capture the submitted values once. A lost response reuses the same
        // client ID and values; a failed attachment never creates another parent.
        this.save ??= () => operations.create(this.clientId);
        operations.saving();
        const parent = await this.save();
        this.assertCurrent();
        this.parent = parent;
      }
      await operations.attach(this.parent.id, ids);
      this.assertCurrent();
      this.complete = true;
      return this.parent;
    } finally {
      this.running = false;
    }
  }
}
