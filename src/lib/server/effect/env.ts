import { Context, Effect, Layer, ManagedRuntime, type Config } from "effect";
import { config, generated } from "../env.effect.ts";

/**
 * Varlock config as an Effect service.
 *
 * `ManagedRuntime.make` does not run the layer. The first `loadEnv()` reads
 * process env that `varlock/auto-load` already injected. This layer does not
 * touch Cloudflare bindings.
 */
export class Env extends Context.Service<Env, Config.Success<typeof config>>()(
  "dollar-holler/Env"
) {
  static readonly layer = Layer.effect(Env, generated);
}

export const runtime = ManagedRuntime.make(Env.layer);

/** Load schema config once through the Effect runtime. Secrets stay `Redacted`. */
export const loadEnv = (): Promise<Config.Success<typeof config>> =>
  runtime.runPromise(
    Effect.gen(function* () {
      return yield* Env;
    })
  );
