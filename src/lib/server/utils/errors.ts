/** Thrown from auth / verify macros; handled in app `onError` as code `UNAUTHORIZED` → 401. */
export class UnauthorizedError extends Error {
  status = 401;

  constructor(public message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Elysia built-ins: thrown for 404/500; `app.onError` maps to `apiErrorBody`. */
export { InternalServerError, NotFoundError } from "elysia";
