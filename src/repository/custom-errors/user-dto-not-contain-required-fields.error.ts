import { TUserCreateDto } from '../types/index';

export class UserDtoNotContainRequiredFieldsError extends Error {
  constructor(userDto: Partial<TUserCreateDto>, fieldNames: string[]) {
    super(`You send userDto: ${JSON.stringify(userDto)}, what not contain fields: ${fieldNames.join(', ')}.`);
  }
}
