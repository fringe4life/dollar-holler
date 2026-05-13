<script lang="ts">
  import { css } from "styled-system/css";
  import { between } from "styled-system/patterns";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
</script>

<div class={css({ spaceY: 4 })}>
  <div class={between({ borderBottomWidth: 2, paddingBlockEnd: 2 })}>
    <Skeleton class={css({ blockSize: 4, inlineSize: 24 })}></Skeleton>
    <Skeleton class={css({ blockSize: 4, inlineSize: 16 })}></Skeleton>
    <Skeleton class={css({ blockSize: 4, inlineSize: 12 })}></Skeleton>
    <Skeleton class={css({ blockSize: 4, inlineSize: 16 })}></Skeleton>
  </div>
  <Skeleton class={css({ blockSize: 10, inlineSize: "full" })}></Skeleton>
  <Skeleton class={css({ blockSize: 10, inlineSize: "full" })}></Skeleton>
</div>
