<script lang="ts">
  import Search from '$lib/icon/Search.svelte'
</script>

<div class="relative flex items-baseline">
  <div class="text-pastelPurple mr-2 self-center"><Search /></div>
  <input
    class="search font-sansserif focus-visible:outline-lavenderIndigo border-b-pastelPurple w-72 border-b-2 border-dashed bg-transparent text-xl text-black outline-none focus-visible:border-solid focus-visible:outline-2"
    type="text"
    name="search"
    placeholder="Search by keyword"
    id=""
  />
  <button class="text-pastelPurple font-sansserif text-xl font-black">Search</button>
</div>
