/** Thrown from auth / verify macros; handled in app `onError` as code `UNAUTHORIZED` → 401. */
export class UnauthorizedError extends Error {
  status = 401;

  constructor(public message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Invalid client input (e.g. illegal invoice status transition); handled as `BAD_REQUEST` → 400. */
export class BadRequestError extends Error {
  status = 400;

  constructor(public message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}
