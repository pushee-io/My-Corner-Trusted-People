module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Native cache contract tests exercise SecureStore's real JS validation.
  transformIgnorePatterns: ['node_modules/(?!expo-secure-store/)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },
};
