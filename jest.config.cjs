module.exports = {
  roots: ['<rootDir>/tests'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/packages/common/src/$1'
  },
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  extensionsToTreatAsEsm: ['.ts']
};
