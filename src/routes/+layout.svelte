<script>
  import "../app.css";
  import Toaster from "$lib/components/ui/toast/Toaster.svelte";

  let { children } = $props();
</script>

<Toaster />

{@render children()}
