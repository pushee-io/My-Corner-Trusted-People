export type ResourceState<T> = { data?: T; error?: string; loading: boolean };

// Discard pending responses when a screen loses focus or its account.
export function createProtectedResource<T>(load: () => Promise<T>, publish: (state: ResourceState<T>) => void) {
  let generation = 0;
  let disposed = false;
  let inFlight = false;
  return {
    async refresh(background = false) {
      if (disposed || (background && inFlight)) return;
      const current = ++generation;
      inFlight = true;
      if (!background) publish({ loading: true });
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
      } finally {
        if (current === generation) inFlight = false;
      }
    },
    clear() {
      generation++;
      inFlight = false;
      if (!disposed) publish({ loading: false });
    },
    dispose() {
      generation++;
      disposed = true;
    },
  };
}
