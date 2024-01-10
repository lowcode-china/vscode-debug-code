module.exports = {
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest'],
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|mjs|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|mjs|js)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'mjs', 'js', 'json'],
};
