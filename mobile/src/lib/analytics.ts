type EventProperties = Record<string, string | number | boolean | undefined>;

const sensitiveKeys = ['phone', 'address', 'description', 'message', 'email', 'name'];

export function trackEvent(eventName: string, properties: EventProperties = {}) {
  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(([key]) => !sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))),
  );

  if (__DEV__) {
    // Keep local analytics visible without sending private pilot content anywhere.
    console.info('[analytics]', eventName, safeProperties);
  }
}
