/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['src/routes/testing.ts', 'src/index.ts'],
  modulePathIgnorePatterns: ['./dist'],
  coverageDirectory: "./coverage",
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./src/tests/testSetup.ts']
};