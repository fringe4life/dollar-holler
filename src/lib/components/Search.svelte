<script lang="ts">
  /**
   * Controlled search input that syncs with the URL query param `q`.
   *
   * The parent page must provide the current search value from the URL and handle
   * search submissions. Use this with SvelteKit's `page` store.
   *
   * @example
   * // In your page component:
   * import { page } from "$app/state";
   * import Search from "$lib/components/Search.svelte";
   *
   * const searchQuery = $derived(page.url.searchParams.get("q") ?? "");
   *
   * const handleSearch = async (terms: string) => {
   *   await myStore.loadItems(terms);  // or similar
   * };
   *
   * onMount(() => loadItems(searchQuery || undefined));
   *
   * // In template:
   * <Search handleSearch={handleSearch} value={searchQuery} />
   */
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Search from "$lib/icon/Search.svelte";
  import type { KeyboardEventHandler } from "svelte/elements";

  type Props = {
    handleSearch: (value: string) => Promise<void>;
    value?: string;
  };

  let { handleSearch, value = "" }: Props = $props();

  // svelte-ignore state_referenced_locally
  let search = $state<string>(value);

  let searchTerm = $derived(search.trim());

  const runSearch = async () => {
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(async () => await handleSearch(searchTerm));
    } else {
      await handleSearch(searchTerm);
    }
    if (searchTerm) {
      goto(`${page.url.pathname}?q=${encodeURIComponent(searchTerm)}`);
    } else {
      goto(`${page.url.pathname}`);
    }
  };

  const handleSearchClick = () => runSearch();

  const handleKeydown: KeyboardEventHandler<
    HTMLInputElement | HTMLButtonElement
  > = (e) => {
    if (e.key === "Enter") {
      runSearch();
    }
  };
</script>

<div
  class="grid grid-flow-col grid-cols-[24px_1fr] items-baseline gap-x-2 inline-full"
>
  <Search class="self-center text-pastelPurple" />
  <div class="relative isolate z-0 flex items-baseline inline-full">
    <input
      class="peer search text-black border-b-2 border-dashed border-b-pastelPurple bg-transparent pe-16 font-sansserif outline-none inline-full placeholder:text-transparent focus-visible:border-solid focus-visible:outline-2 focus-visible:outline-lavenderIndigo md:pe-0 md:inline-52 lg:text-xl lg:inline-72"
      type="search"
      name="search"
      placeholder="Search by keyword"
      id="search"
      bind:value={search}
      onkeydown={handleKeydown}
    />
    <button
      type="button"
      onclick={handleSearchClick}
      onkeydown={handleKeydown}
      class="pointer-events-none absolute translate-x-0 transform font-sansserif text-xl font-black text-pastelPurple transition-transform duration-200 ease-out inline-15.5 peer-not-placeholder-shown:text-lavenderIndigo peer-focus:text-lavenderIndigo peer-focus:hover:text-daisyBush peer-focus:focus:text-daisyBush supports-linear:ease-glide"
      >Search</button
    >
  </div>
</div>

<style>
  @reference "#app.css";
  input:is(:focus, :not(:placeholder-shown)) + button {
    @apply pointer-events-auto right-0 text-right md:right-auto md:translate-x-52 lg:translate-x-72;
  }
</style>
