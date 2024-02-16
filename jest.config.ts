import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	coveragePathIgnorePatterns: ['/node_modules/'],
};

export default jestConfig;
