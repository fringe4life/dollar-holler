<script>
  import "../app.css";
  import Toaster from "#lib/components/patterns/toast/Toaster.svelte";

  let { children } = $props();
</script>

<Toaster>
  {@render children()}
</Toaster>
