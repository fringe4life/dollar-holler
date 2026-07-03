type Ok<T extends object = object> = { ok: true } & T;

type Err<E extends object = object> = { ok: false } & E;

export type Result<
  T extends object = object,
  E extends object = { message: string },
> = Ok<T> | Err<E>;

export const ok = <T extends object>(value: T): Ok<T> => ({
  ok: true,
  ...value,
});

export const err = <E extends object>(value: E): Err<E> => ({
  ok: false,
  ...value,
});
