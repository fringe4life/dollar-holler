import { Context, Effect, Layer, ManagedRuntime, Redacted } from "effect";

/**
 * Worker env as an Effect service. Varlock already validated at
 * `varlock run` / build; Alchemy binds the same keys (`WebsiteEnv`).
 * No Effect Config/Schema (and no Valibot) re-decode in the isolate.
 *
 * First `loadEnv()` / `getAuth()` reads `process.env` that Varlock
 * injected in tests/dev, or that the Worker copies from Website
 * bindings. Secrets stay `Redacted`.
 */
export type AppEnv = {
  VARLOCK_ENV: string;
  PUBLIC_BASE_URL: string;
  ORIGIN: string;
  BETTER_AUTH_SECRET: Redacted.Redacted<string>;
  OGYGIA_SECRET: Redacted.Redacted<string>;
};

type BoundString = Exclude<keyof AppEnv, never>;

const requiredString = (key: BoundString): string => {
  const value = process.env[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new Error(
    `Missing ${key}. Varlock validates at build/dev; Alchemy binds it on the Worker.`
  );
};

export const readAppEnv = (): AppEnv => ({
  BETTER_AUTH_SECRET: Redacted.make(requiredString("BETTER_AUTH_SECRET")),
  OGYGIA_SECRET: Redacted.make(requiredString("OGYGIA_SECRET")),
  ORIGIN: requiredString("ORIGIN"),
  PUBLIC_BASE_URL: requiredString("PUBLIC_BASE_URL"),
  VARLOCK_ENV: requiredString("VARLOCK_ENV"),
});

export class Env extends Context.Service<Env, AppEnv>()("dollar-holler/Env") {
  static readonly layer = Layer.sync(Env, readAppEnv);
}

export const runtime = ManagedRuntime.make(Env.layer);

/** Load Worker env once through the Effect runtime. Secrets stay `Redacted`. */
export const loadEnv = (): Promise<AppEnv> =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* Env;
    })
  );
