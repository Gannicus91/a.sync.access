module.exports = {
	projects: ['<rootDir>'],
	testMatch: ['<rootDir>/src/**/*[sS]pec.ts'],
	rootDir: './',
	testTimeout: 20000,
	testEnvironment: 'node',
	bail: 2,
	reporters: ['default'],

	silent: true,
	clearMocks: true,

	collectCoverage: true,
	coverageReporters: ['lcov'],
	coverageDirectory: '<rootDir>/coverage',
	coverageProvider: 'v8',

	preset: 'ts-jest',
	modulePaths: ['<rootDir>/src/'],
};
