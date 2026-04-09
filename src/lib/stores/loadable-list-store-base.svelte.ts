import type { Maybe } from "$lib/types";

/** Shared async list UI state: rows, loading, error, and a small reset for cleanup. */
export abstract class LoadableListStoreBase<T> {
  items = $state<T[]>([]);
  loading = $state<boolean>(false);
  error = $state<Maybe<string>>(null);

  protected resetLoadableListState() {
    this.items.length = 0;
    this.loading = false;
    this.error = null;
  }
}
