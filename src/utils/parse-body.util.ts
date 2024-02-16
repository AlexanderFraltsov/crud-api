import { TRequestBody } from '../types';

export const parseBody = (data: Buffer[]): TRequestBody => JSON.parse(Buffer.concat(data).toString());
