const path = require('path');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: path.resolve(__dirname, '..'),
});

const customJestConfig = {
  rootDir: path.resolve(__dirname, '..'),
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/frontend/**/*.test.{ts,tsx,js,jsx}'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.css$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  transformIgnorePatterns: ['/node_modules/'],
};

module.exports = createJestConfig(customJestConfig);