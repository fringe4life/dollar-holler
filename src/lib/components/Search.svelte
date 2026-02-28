<script lang="ts">
  import Search from "$lib/icon/Search.svelte";
  import type { ChangeEventHandler, FormEventHandler } from "svelte/elements";

  let searchTerms = $state<string>("");
  let derivedTerms = $derived(searchTerms.trim());
  let prev = $state<string>("");

  type Props = {
    handleSearch: (searchTerms: string) => void;
  };

  let { handleSearch }: Props = $props();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const runSearch = () => Promise.resolve(handleSearch(derivedTerms));

    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(runSearch);
    } else {
      runSearch();
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    searchTerms = e.currentTarget.value;
  };

  // needed as type="search" doesn't trigger onchange when the value is cleared via special x button // Only trigger a clear when transitioning from non-empty to empty to avoid duplicate submissions
  $effect(() => {
    const curr = derivedTerms ?? "";
    if (prev !== "" && curr === "") {
      handleSearch("");
      prev = curr;
    }
  });
</script>

<form
  onsubmit={handleSubmit}
  class="w-full grid grid-flow-col grid-cols-[24px_1fr] gap-x-2 items-baseline"
>
  <div class="text-pastelPurple self-center"><Search /></div>
  <div class="relative isolate z-0 flex items-baseline w-full">
    <input
      class="peer placeholder:text-transparent search font-sansserif focus-visible:outline-lavenderIndigo border-b-pastelPurple w-full border-b-2 border-dashed bg-transparent pr-16 text-black outline-none focus-visible:border-solid focus-visible:outline-2 md:w-52 md:pr-0 lg:w-72 lg:text-xl"
      type="search"
      name="search"
      placeholder="Search by keyword"
      id="search"
      bind:value={searchTerms}
      oninput={handleChange}
    />
    <button
      type="submit"
      class="pointer-events-none peer-focus:text-lavenderIndigo peer-not-placeholder-shown:text-lavenderIndigo peer-focus:hover:text-daisyBush peer-focus:focus:text-daisyBush text-pastelPurple translate-x-0 font-sansserif w-15.5 absolute transform text-xl font-black transition-transform duration-200 ease-out"
      >Search</button
    >
  </div>
</form>

<style>
  input:is(:focus, :not(:placeholder-shown)) + button {
    @apply right-0 md:right-auto pointer-events-auto text-right md:translate-x-52 lg:translate-x-72;
  }
</style>
