<script lang="ts">
  import RouteError from "#lib/components/RouteError.svelte";
  import { page } from "$app/state";
</script>

<RouteError
  heading={page.status.toString()}
  message="We can't find the page you're looking for."
  subheading="Sorry"
/>
