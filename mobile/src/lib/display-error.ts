type ErrorRecord = {
  code?: unknown;
  message?: unknown;
};

export function displayError(caught: unknown, fallback: string): string {
  if (caught instanceof Error && caught.message.trim()) {
    return caught.message;
  }

  if (!caught || typeof caught !== 'object') {
    return fallback;
  }

  const error = caught as ErrorRecord;
  if (typeof error.message === 'string' && /network request failed|failed to fetch/i.test(error.message)) {
    return 'Could not reach My Corner. Check your connection and try again.';
  }

  if (typeof error.code === 'string' && error.code.trim()) {
    return `${fallback} Reference: ${error.code.trim()}.`;
  }

  return fallback;
}
