import { usersRepository } from '../repository/users';
import { getErrorStatusCode } from '../utils';
import { NonExistingEnpointError } from '../custom-errors';
import { EHttpMethod, EHttpStatusCode } from '../enums';
import { TUserCreateDto, TUserUpdateDto } from '../repository/types';
import { TRequest, TRequestBody, TResponse } from '../types';
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

const usersRouteResolve = (response: TResponse, method: EHttpMethod, param: string | undefined, body?: TRequestBody) => {
	if (method === EHttpMethod.GET) {
		if (!param) {
			const users = usersRepository.getUsers();
			response.statusCode = EHttpStatusCode.OK;
			return response.end(JSON.stringify(users));
		} else {
			const user = usersRepository.getUser(param);
			response.statusCode = EHttpStatusCode.OK;
			return response.end(JSON.stringify(user));
		}
	}

	if (method === EHttpMethod.POST) {
		const user = usersRepository.createUser(<TUserCreateDto>body);
		response.statusCode = EHttpStatusCode.CREATED;
		return response.end(JSON.stringify(user));
	}

	if (method === EHttpMethod.PUT) {
		const user = usersRepository.updateUser(param, <TUserUpdateDto>body);
		response.statusCode = EHttpStatusCode.OK;
		return response.end(JSON.stringify(user));
	}

	if (method === EHttpMethod.DELETE) {
		usersRepository.deleteUser(param);
		response.statusCode = EHttpStatusCode.NO_CONTENT;
		return response.end();
	}
}
