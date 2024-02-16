export class NonExistingEnpointError extends Error {
  constructor() {
    super('Request to non-existing endpoint!');
  }
}
