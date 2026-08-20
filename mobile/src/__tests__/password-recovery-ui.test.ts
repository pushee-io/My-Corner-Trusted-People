import { readFileSync } from 'node:fs';

describe('password recovery UI', () => {
  const signIn = readFileSync('app/sign-in.tsx', 'utf8');
  const request = readFileSync('app/forgot-password.tsx', 'utf8');
  const update = readFileSync('app/reset-password.tsx', 'utf8');
  const appConfig = readFileSync('app.json', 'utf8');

  it('links sign in to the reset request without exposing account existence', () => {
    expect(signIn).toContain('href="/forgot-password"');
    expect(signIn).toContain('Forgot password?');
    expect(request).toContain('If an account matches that address');
    expect(request).not.toContain('account exists');
  });

  it('uses the registered app scheme and validates incoming recovery links', () => {
    expect(appConfig).toContain('"scheme": "mycorner"');
    expect(update).toContain('createPasswordRecoverySession');
    expect(update).toContain('Linking.getInitialURL()');
    expect(update).toContain("Linking.addEventListener('url'");
    expect(update).toContain('invalid or has expired');
  });

  it('provides labelled password inputs, alerts, and disabled states', () => {
    expect(update).toContain('accessibilityLabel="New password"');
    expect(update).toContain('accessibilityLabel="Confirm new password"');
    expect(update).toContain('accessibilityRole="alert"');
    expect(update).toContain('accessibilityState={{ disabled }}');
    expect(update).toContain('secureTextEntry');
  });
});
