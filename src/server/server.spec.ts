import request from 'supertest';
import { Server } from 'http';
import { validate } from 'uuid';

import { startServer } from './server';
import { EHttpStatusCode } from '../enums';
import { TUser, TUserCreateDto } from '../repository/types';
import { API_PREFIX, USER_REPOSITORY_PREFIX } from '../constants/constants';
import { UserNotFoundError, InvalidUserIdError, UserDtoNotContainRequiredFieldsError } from '../repository/custom-errors';

describe('server', () => {
	console.log = jest.fn();
	let app: Server = null;
	const TEST_PORT = 9000;
	const BASE_PATH = `/${API_PREFIX}/${USER_REPOSITORY_PREFIX}`

	beforeEach(() => {
		app = startServer(TEST_PORT);
	});

	afterEach(() => app.close());

	describe('scenario 1', () => {
		const username = 'Boris Britva';
		const age = 50;
		const hobbies = ['guns', 'garden'];
		const createdDto = <TUserCreateDto>{
			username,
			age,
			hobbies,
		};

		const newName = 'John Monobrow';

		it('Get all records with a GET api/users request', async () => {
			const expected: TUser[] = [];
			const res = await request(app).get(BASE_PATH);
			expect(res.status).toBe(EHttpStatusCode.OK);
			expect(<TUser[]>JSON.parse(res.text)).toStrictEqual(expected);
		});

		let createdUser: TUser = null;
		it('A new object is created by a POST api/users request', async () => {
			const res = await request(app).post(BASE_PATH).send(createdDto);
			createdUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.CREATED);
			expect(validate(createdUser.id)).toBeTruthy();
			expect(createdUser.username).toBe(username);
			expect(createdUser.age).toBe(age);
			expect(createdUser.hobbies).toStrictEqual(hobbies);
		});

		it('With a GET api/user/{userId} request, we try to get the created record by its id', async () => {
			const res = await request(app).get(`${BASE_PATH}/${createdUser.id}`);
			const gettingUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.OK);
			expect(gettingUser).toStrictEqual(createdUser);
		});

		it('We try to update the created record with a PUT api/users/{userId}request', async () => {
			const res = await request(app).put(`${BASE_PATH}/${createdUser.id}`).send({ username: newName });
			const updatedUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.OK);
			expect(updatedUser.id).toBe(createdUser.id);
			expect(updatedUser.hobbies).toStrictEqual(createdUser.hobbies);
			expect(updatedUser.age).toBe(createdUser.age);
			expect(updatedUser.username).toBe(newName);
		});

		it('With a DELETE api/users/{userId} request, we delete the created object by id', async () => {
			const res = await request(app).delete(`${BASE_PATH}/${createdUser.id}`);
			expect(res.status).toBe(EHttpStatusCode.NO_CONTENT);
		});

		it('With a GET api/users/{userId} request, we are trying to get a deleted object by id', async () => {
			const res = await request(app).get(`${BASE_PATH}/${createdUser.id}`);
			expect(res.status).toBe(EHttpStatusCode.NOT_FOUND);
			expect(res.text).toBe(new UserNotFoundError(createdUser.id).message);
		});
	});

	describe('scenario 2', () => {
		const firstCreatedDto = <TUserCreateDto>{
			username: 'Boris Britva',
			age: 50,
			hobbies: ['guns', 'garden'],
		};
		const secondCreatedDto = <TUserCreateDto>{
			username: 'John Monobrow',
			age: 13,
			hobbies: ['poetry', 'medicine'],
		};
		const thirdCreatedDto = <TUserCreateDto>{
			username: 'Klava Notice',
			age: 25,
			hobbies: ['cinema', 'games'],
		};

		let firstUser: TUser = null;
		let secondUser: TUser = null;
		let thirdUser: TUser = null;
		it('A new object is created by a POST api/users request', async () => {
			const res = await request(app).post(BASE_PATH).send(firstCreatedDto);
			firstUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.CREATED);
			expect(validate(firstUser.id)).toBeTruthy();
			expect(firstUser.username).toBe(firstCreatedDto.username);
			expect(firstUser.age).toBe(firstCreatedDto.age);
			expect(firstUser.hobbies).toStrictEqual(firstCreatedDto.hobbies);
		});
		it('Second new object is created by a POST api/users request', async () => {
			const res = await request(app).post(BASE_PATH).send(secondCreatedDto);
			secondUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.CREATED);
			expect(validate(secondUser.id)).toBeTruthy();
			expect(secondUser.username).toBe(secondCreatedDto.username);
			expect(secondUser.age).toBe(secondCreatedDto.age);
			expect(secondUser.hobbies).toStrictEqual(secondCreatedDto.hobbies);
		});
		it('Third new object is created by a POST api/users request', async () => {
			const res = await request(app).post(BASE_PATH).send(thirdCreatedDto);
			thirdUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.CREATED);
			expect(validate(thirdUser.id)).toBeTruthy();
			expect(thirdUser.username).toBe(thirdCreatedDto.username);
			expect(thirdUser.age).toBe(thirdCreatedDto.age);
			expect(thirdUser.hobbies).toStrictEqual(thirdCreatedDto.hobbies);
		});
		it('Get all records with a GET api/users request return three objects', async () => {
			const expected: TUser[] = [firstUser, secondUser, thirdUser];
			const res = await request(app).get(BASE_PATH);
			expect(res.status).toBe(EHttpStatusCode.OK);
			expect(<TUser[]>JSON.parse(res.text)).toStrictEqual(expected);
		});
		it('With a DELETE api/users/{userId} request, we delete one of the created objects by id', async () => {
			const res = await request(app).delete(`${BASE_PATH}/${secondUser.id}`);
			expect(res.status).toBe(EHttpStatusCode.NO_CONTENT);
		});
		it('Get all records with a GET api/users request return two objects', async () => {
			const expected: TUser[] = [firstUser, thirdUser];
			const res = await request(app).get(BASE_PATH);
			expect(res.status).toBe(EHttpStatusCode.OK);
			expect(<TUser[]>JSON.parse(res.text)).toStrictEqual(expected);
		});
	});

	describe('scenario 3', () => {
		const username = 'Boris Britva';
		const age = 50;
		const hobbies = ['guns', 'garden'];
		const createdDto = <TUserCreateDto>{
			username,
			age,
			hobbies,
		};

		const WRONG_ID = '123';

		let createdUser: TUser = null;

		it('A new object is created by a POST api/users request', async () => {
			const res = await request(app).post(BASE_PATH).send(createdDto);
			createdUser = <TUser>JSON.parse(res.text);
			expect(res.status).toBe(EHttpStatusCode.CREATED);
			expect(validate(createdUser.id)).toBeTruthy();
			expect(createdUser.username).toBe(username);
			expect(createdUser.age).toBe(age);
			expect(createdUser.hobbies).toStrictEqual(hobbies);
		});
		it('With a GET api/users/{userId} request, we are trying to get a object by uncorrect id', async () => {
			const res = await request(app).get(`${BASE_PATH}/${WRONG_ID}`);
			expect(res.status).toBe(EHttpStatusCode.BAD_REQUEST);
			expect(res.text).toBe(new InvalidUserIdError(WRONG_ID).message);
		});
		it('Try new object creating by a POST api/users without required properties', async () => {
			const dto = {	username,	age };
			const res = await request(app).post(BASE_PATH).send(dto);
			expect(res.status).toBe(EHttpStatusCode.BAD_REQUEST);
			expect(res.text).toBe(new UserDtoNotContainRequiredFieldsError(dto, ['hobbies']).message);
		});
		it('With a PUT api/users/{userId} request, we are trying to put a object by uncorrect id', async () => {
			const res = await request(app).put(`${BASE_PATH}/${WRONG_ID}`).send({ username: 'new' });
			expect(res.status).toBe(EHttpStatusCode.BAD_REQUEST);
			expect(res.text).toBe(new InvalidUserIdError(WRONG_ID).message);
		});
		it('With a DELETE api/users/{userId} request, we are trying to delete a object by uncorrect id', async () => {
			const res = await request(app).delete(`${BASE_PATH}/${WRONG_ID}`);
			expect(res.status).toBe(EHttpStatusCode.BAD_REQUEST);
			expect(res.text).toBe(new InvalidUserIdError(WRONG_ID).message);
		});
		it('With a DELETE api/users/{userId} request, we delete created object by id', async () => {
			const res = await request(app).delete(`${BASE_PATH}/${createdUser.id}`);
			expect(res.status).toBe(EHttpStatusCode.NO_CONTENT);
		});
		it('With a DELETE api/users/{userId} request, we trying delete deleted object by id', async () => {
			const res = await request(app).delete(`${BASE_PATH}/${createdUser.id}`);
			expect(res.status).toBe(EHttpStatusCode.NOT_FOUND);
			expect(res.text).toBe(new UserNotFoundError(createdUser.id).message);
		});
	});
});
