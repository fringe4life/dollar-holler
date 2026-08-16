<script lang="ts">
  import { grid } from "#styled-system/patterns/index.js";
  import { reviews } from "#features/landing-page/constants/reviews.ts";
  import ReviewItem from "./ReviewItem.svelte";
</script>

<div class={grid({ gap: 6, columns: { base: 1, sm: 2 } })}>
  {#each reviews as review (review.name)}
    <ReviewItem {review} />
  {/each}
</div>
