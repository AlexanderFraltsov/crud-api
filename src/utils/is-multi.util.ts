import { argv } from 'node:process';

export const isMulti = (): boolean => {
	const MULTI_PREFIX = '--MULTI=';
	const multiFlag = argv.find((arg) => arg.startsWith(MULTI_PREFIX));
	if (multiFlag) {
		return multiFlag.slice(MULTI_PREFIX.length) === 'true';
	}
	return false;
}
