export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`Record with id === ${userId} doesn't exist`);
  }
}
