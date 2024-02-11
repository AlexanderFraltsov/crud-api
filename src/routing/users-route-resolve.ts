import { usersRepository } from '../repository/users';
import { TRequestBody, TResponse } from '../types';
import { EHttpMethod, EHttpStatusCode } from '../enums';
import { TUserCreateDto, TUserUpdateDto } from '../repository/types';

export const usersRouteResolve = (response: TResponse, method: EHttpMethod, param: string | undefined, body?: TRequestBody) => {
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
