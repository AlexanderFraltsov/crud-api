export class InvalidUserIdError extends Error {
  constructor(userId: string) {
    super(`UserId (${userId}) is invalid (not uuid)`);
  }
}
