<script lang="ts">
  import { between } from "#styled-system/patterns/index.js";
  import PaginationControlSkeleton from "./PaginationControlSkeleton.svelte";
  import PaginationLimitSkeleton from "./PaginationLimitSkeleton.svelte";
</script>

<div
  aria-label="Loading pagination controls"
  aria-live="polite"
  class={between({ marginBlockEnd: 6, gap: 4 })}
  role="status"
>
  <PaginationLimitSkeleton />
  <PaginationControlSkeleton />
</div>
