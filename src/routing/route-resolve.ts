import { usersRouteResolve } from './users-route-resolve';
import { getErrorStatusCode } from '../utils';
import { TRequest, TResponse } from '../types';
import { NonExistingEnpointError } from '../custom-errors';
import { API_PREFIX, USER_REPOSITORY_PREFIX } from '../constants/constants';

export const routeResolve = ({ method, host, pathname, body }: TRequest, response: TResponse) => {
	console.log(`${method}: ${host}${pathname}${body ? ' | body: ' + JSON.stringify(body) : ''}`);
	try {
		const pathSegments = pathname.split('/').filter(segment => Boolean(segment));
		const [apiPrefix, repositoryPrefix, param] = pathSegments;

		if (apiPrefix === API_PREFIX && repositoryPrefix === USER_REPOSITORY_PREFIX) {
			return usersRouteResolve(response, method, param, body);
		}

		throw new NonExistingEnpointError();
	} catch (error) {
  	response.statusCode = getErrorStatusCode(error);
		response.end(error.message);
	}
}
