export const tokens = {
  color: {
    background: '#FBF7EE',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#0E6B50',
    primaryPressed: '#0A5A43',
    secondary: '#F2B544',
    accent: '#E76F51',
    textPrimary: '#102A43',
    textSecondary: '#52606D',
    border: '#D9E2EC',
    success: '#0E6B50',
    warning: '#F2B544',
    error: '#B84A36',
    information: '#52606D',
    disabled: '#9FB3C8',
    focusRing: '#102A43',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 8,
    lg: 8,
    pill: 999,
  },
  type: {
    display: 32,
    page: 28,
    section: 22,
    card: 18,
    body: 16,
    support: 14,
    label: 13,
    minimum: 12,
  },
  touch: {
    min: 48,
  },
} as const;

export type Tokens = typeof tokens;
