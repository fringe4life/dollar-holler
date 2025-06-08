<script lang="ts">
  import Search from '$lib/icon/Search.svelte'
</script>

<div class="relative isolate z-0 flex items-baseline">
  <div class="text-pastelPurple mr-2 self-center"><Search /></div>
  <input
    class="search font-sansserif focus-visible:outline-lavenderIndigo border-b-pastelPurple border-b-2 border-dashed bg-transparent text-black outline-none focus-visible:border-solid focus-visible:outline-2 md:w-56 lg:w-72 lg:text-xl"
    type="text"
    name="search"
    placeholder="Search by keyword"
    id=""
  />
  <button class="text-pastelPurple font-sansserif text-xl font-black">Search</button>
</div>
