import { validate, v4 } from 'uuid';

import {
	InvalidUserIdError,
	UserDtoNotContainRequiredFieldsError,
	UserNotFoundError,
} from './custom-errors';
import { TUser, TUserCreateDto, TUserUpdateDto } from './types';

export class UsersRepository {
	private users: TUser[] = [];

	constructor(users: TUser[]) {
		this.users = users;
	}

	public getUsers(): TUser[] {
		return this.users;
	}

	public getUser(userId: string): TUser {
		if (!validate(userId)) {
			throw new InvalidUserIdError(userId);
		}
		const user = this.users.find(({ id }) => id === userId);
		if (!user) {
			throw new UserNotFoundError(userId);
		}

		return user;
	}

	public createUser(userDto: TUserCreateDto) {
		this.validateCreateDto(userDto);

		const user = { ...userDto, id: v4() };
		this.users.push(user);
		return user;
	}

	public updateUser(userId: string, userDto: TUserUpdateDto) {
		const user = this.getUser(userId);
		const updatedUser = { ...user, ...userDto };

		this.users = this.users.map((entity) => entity.id === userId ? updatedUser : entity);
		return updatedUser;
	}

	public deleteUser(userId: string) {
		this.getUser(userId);
		this.users = this.users.filter((entity) => entity.id !== userId);
	}

	private validateCreateDto(userDto: TUserCreateDto) {
		const fieldNames: string[] = [];

		if (!userDto.username) {
			fieldNames.push('username');
		}

		if (!userDto.age && userDto.age !== 0) {
			fieldNames.push('age');
		}

		if (!userDto.hobbies) {
			fieldNames.push('hobbies');
		}

		if (fieldNames.length > 0) {
			throw new UserDtoNotContainRequiredFieldsError(userDto, fieldNames);
		}
	}
}
