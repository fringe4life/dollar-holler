<script lang="ts">
  import type { Snippet } from "svelte";
  import { redirectAuthenticatedAuthEntry } from "#features/auth/auth-entry-session.ts";

  interface Props {
    ogygiaFallback?: Snippet;
  }

  let { ogygiaFallback: _ogygiaFallback }: Props = $props();
  redirectAuthenticatedAuthEntry();
</script>
