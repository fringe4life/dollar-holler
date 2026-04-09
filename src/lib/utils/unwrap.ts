/** Eden Treaty helpers: map HTTP error bodies to thrown errors. */

export interface UnwrapTreatyOptions {
  fallbackMessage: string;
  emptyDataMessage?: string;
}

/** Standard API error body from `status(code, { message })`. */
export const messageFromEdenValue = (
  value: unknown,
  fallback: string
): string => {
  if (typeof value === "string") {
    return value;
  }
  if (
    value !== null &&
    typeof value === "object" &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  ) {
    return (value as { message: string }).message;
  }
  return fallback;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type TreatyResultLike<TData> = {
  data: TData | null;
  error: { status: number; value: unknown } | null;
};

export const unwrapTreatyResult = <TData>(
  result: TreatyResultLike<TData>,
  options: UnwrapTreatyOptions
): TData => {
  if (result.error) {
    const msg = messageFromEdenValue(
      result.error.value,
      options.fallbackMessage
    );
    throw new ApiError(msg, result.error.status, result.error.value);
  }
  if (result.data == null) {
    throw new Error(options.emptyDataMessage ?? options.fallbackMessage);
  }
  return result.data;
};

export const unwrapTreaty = async <TData>(
  promise: Promise<TreatyResultLike<TData>>,
  options: UnwrapTreatyOptions
): Promise<TData> => {
  return unwrapTreatyResult(await promise, options);
};
