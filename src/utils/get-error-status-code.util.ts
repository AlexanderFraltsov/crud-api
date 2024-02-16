import {
	InvalidUserIdError,
	UserDtoNotContainRequiredFieldsError,
	UserNotFoundError,
} from '../repository/custom-errors';
import { EHttpStatusCode } from '../enums';
import { NonExistingEnpointError } from '../custom-errors';

export const getErrorStatusCode = (error: Error): EHttpStatusCode => {
	if (error instanceof InvalidUserIdError || error instanceof UserDtoNotContainRequiredFieldsError) {
		return EHttpStatusCode.BAD_REQUEST;
	}

	if (error instanceof UserNotFoundError || error instanceof NonExistingEnpointError) {
		return EHttpStatusCode.NOT_FOUND;
	}

	return EHttpStatusCode.INTERNAL_SERVER_ERROR;
}
