/** Invalid client input (e.g. illegal invoice status transition). */
export class BadRequestError extends Error {
  constructor(public message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}
