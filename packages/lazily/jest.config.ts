import type { Config } from 'jest';

const config: Config = {
    displayName: 'lazy',
    preset: '../../jest.preset.ts',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/packages/lazily',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.spec.ts',
        '!src/**/*.test.ts',
    ],
};

export default config;
