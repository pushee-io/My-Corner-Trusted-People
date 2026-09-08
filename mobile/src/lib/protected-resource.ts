export type ResourceState<T> = { data?: T; error?: string; loading: boolean };

// Discard pending responses when a screen loses focus or its account.
export function createProtectedResource<T>(load: () => Promise<T>, publish: (state: ResourceState<T>) => void) {
  let generation = 0;
  let disposed = false;
  return {
    async refresh() {
      if (disposed) return;
      const current = ++generation;
      publish({ loading: true });
      try {
        const data = await load();
        if (!disposed && current === generation) publish({ data, loading: false });
      } catch {
        if (!disposed && current === generation) {
          publish({
            error: 'This view is unavailable. Check your connection and account, then try again.',
            loading: false,
          });
        }
      }
    },
    clear() {
      generation++;
      if (!disposed) publish({ loading: false });
    },
    dispose() {
      generation++;
      disposed = true;
    },
  };
}
