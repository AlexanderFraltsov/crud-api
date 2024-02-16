import { EHttpMethod } from '../enums';
import { TRequestBody } from './request-body.type';

export type TRequest = {
	method: EHttpMethod;
	host: string;
	pathname: string;
	body: TRequestBody;
};
