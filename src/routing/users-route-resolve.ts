import cluster from 'node:cluster';

import { isMulti } from '../utils';
import { UsersRepository } from '../repository/users';
import { TRequestBody, TResponse } from '../types';
import { EHttpMethod, EHttpStatusCode } from '../enums';
import { TUser, TUserCreateDto, TUserUpdateDto } from '../repository/types';

const isMulty = isMulti();

let usersState: TUser[] = [];

const getUserRepository = async (): Promise<UsersRepository> => {
	if (isMulty) {
		usersState = await getState();
		return new UsersRepository(usersState);
	} else {
		return new UsersRepository(usersState);
	}
}

const getState = async (): Promise<TUser[]> => new Promise(resolve => {
	process.send({ cmd: 'getState', id: cluster.worker.id });
	const listener = (msg: { cmd: string; users: TUser[] }) => {
		if (msg.cmd) {
			if (msg.cmd === 'stateChanged' || msg.cmd === 'sendState') {
				resolve(msg.users);
				process.removeListener('message', listener);
			}
		}
	}
	process.addListener('message', listener);
});

const sendStateChangeMsg = () => {
	process.send({ cmd: 'stateChanges', users: usersState, id: cluster.worker.id });
}

export const usersRouteResolve = async (response: TResponse, method: EHttpMethod, param: string | undefined, body?: TRequestBody) => {
	const usersRepository = await getUserRepository();
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
		usersState = usersRepository.getUsers();
		if (isMulty) {
			sendStateChangeMsg();
		}
		return response.end(JSON.stringify(user));
	}

	if (method === EHttpMethod.PUT) {
		const user = usersRepository.updateUser(param, <TUserUpdateDto>body);
		response.statusCode = EHttpStatusCode.OK;
		usersState = usersRepository.getUsers();
		if (isMulty) {
			sendStateChangeMsg();
		}
		return response.end(JSON.stringify(user));
	}

	if (method === EHttpMethod.DELETE) {
		usersRepository.deleteUser(param);
		response.statusCode = EHttpStatusCode.NO_CONTENT;
		usersState = usersRepository.getUsers();
		if (isMulty) {
			sendStateChangeMsg();
		}
		return response.end();
	}
}
