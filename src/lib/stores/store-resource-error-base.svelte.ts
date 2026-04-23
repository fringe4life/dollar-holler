import {
  resourceOperationFallback,
  type StoreOperation,
} from "$lib/utils/error-message";
import { LoadableListStoreBase } from "./loadable-list-store-base.svelte";

/** Shared resource labels + derived fallback strings for API/toast copy. */
export abstract class StoreResourceErrorBase<
  T,
> extends LoadableListStoreBase<T> {
  protected abstract readonly resourceSingular: string;
  protected abstract readonly resourcePlural: string;

  protected fallbackFor(op: StoreOperation): string {
    return resourceOperationFallback(
      op,
      this.resourceSingular,
      this.resourcePlural
    );
  }
}
