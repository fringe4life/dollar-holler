<script lang="ts">
  import Search from "$lib/icon/Search.svelte";
  import type { ChangeEventHandler, FormEventHandler } from "svelte/elements";

  let searchTerms = $state<string>("");

  type Props = {
    handleSearch: (searchTerms: string) => void;
  };

  let { handleSearch }: Props = $props();

  const handleSubmit: FormEventHandler<HTMLFormElement> = () => {
    handleSearch(searchTerms);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    searchTerms = e.currentTarget.value;
  };
</script>

<form onsubmit={handleSubmit} class="relative flex w-full items-baseline">
  <div class="relative isolate z-0 flex w-full items-baseline">
    <div class="text-pastelPurple mr-2 self-center"><Search /></div>
    <input
      class=" search font-sansserif focus-visible:outline-lavenderIndigo border-b-pastelPurple w-full border-b-2 border-dashed bg-transparent pr-20 text-black outline-none focus-visible:border-solid focus-visible:outline-2 md:w-56 md:pr-0 lg:w-72 lg:text-xl"
      type="search"
      name="search"
      placeholder="Search by keyword"
      id="search"
      bind:value={searchTerms}
      onchange={handleChange}
    />
    <button
      type="submit"
      class="text-pastelPurple font-sansserif pointer-events-none absolute left-8 transform text-xl font-black transition-transform duration-200 ease-out"
      >Search</button
    >
  </div>
</form>

<style>
  @reference "../../app.css";

  ::placeholder {
    @apply text-transparent;
  }

  input:is(:focus, :not(:placeholder-shown)) + button {
    @apply text-lavenderIndigo pointer-events-auto right-0 text-right md:right-auto md:translate-x-56 lg:translate-x-72;
  }

  input:focus + button:is(:hover, :focus) {
    @apply text-daisyBush;
  }
</style>
