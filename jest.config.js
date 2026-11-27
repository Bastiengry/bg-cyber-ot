module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.@(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.afterenv.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-worklets|react-native-reanimated)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**', '!src/constants/**'],
};
