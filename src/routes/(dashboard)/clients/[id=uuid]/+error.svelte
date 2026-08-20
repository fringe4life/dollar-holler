<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import RouteError from "#lib/components/patterns/RouteError.svelte";
  import { page } from "$app/state";
</script>

<RouteError
  heading="Not Found!"
  message={page.error?.message ?? ""}
  minBlockSize={css({ minBlockSize: "calc(100dvh - var(--spacing-16))" })}
/>
