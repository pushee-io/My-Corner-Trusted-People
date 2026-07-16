export function initMonitoring() {
  if (__DEV__) {
    console.info('[monitoring] Sentry disabled in local prototype. Set SENTRY_DSN for real builds.');
  }
}

export function captureError(error: unknown, context?: Record<string, string>) {
  if (__DEV__) {
    console.error('[monitoring]', context, error);
  }
}
