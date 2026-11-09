/**
 * Headers for `auth.api.*` when the caller is a Kit remote form.
 *
 * Ogygia prerenders `(auth)` and the island posts `?/remote=…` as
 * `application/x-www-form-urlencoded`. Passing that request's headers
 * through makes Better Auth parse the Kit field names
 * (`email/1kgutvo/signup`) as the sign-up body, so `user` is missing and
 * the remote returns 200 with "Signup failed". Cookie/Origin stay; the
 * form Content-Type does not.
 */
export const authApiHeaders = (request: Request): Headers => {
  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie !== null && cookie !== "") {
    headers.set("cookie", cookie);
  }

  const origin = requestOrigin(request);
  if (origin !== undefined) {
    headers.set("origin", origin);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent !== null && userAgent !== "") {
    headers.set("user-agent", userAgent);
  }

  headers.set("content-type", "application/json");
  return headers;
};

const requestOrigin = (request: Request): string | undefined => {
  const origin = request.headers.get("origin");
  if (origin !== null && origin !== "" && origin !== "null") {
    return urlOrigin(origin) ?? origin;
  }
  const referer = request.headers.get("referer");
  if (referer !== null && referer !== "") {
    return urlOrigin(referer);
  }
  return undefined;
};

const urlOrigin = (value: string): string | undefined => {
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};
