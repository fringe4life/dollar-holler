<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { grid } from "#styled-system/patterns/index.js";
  import { reviews } from "#features/landing-page/constants/reviews.ts";
  import ReviewItem from "./ReviewItem.svelte";

  const reviewGridClass = grid({
    alignItems: "start",
    columns: { base: 1, md: 2 },
    gap: { base: 5, md: 7 },
  });

  const cardOffsetClass = css({
    "& > *": {
      _even: { marginBlockStart: { base: 0, md: 7 } },
    },
  });
</script>

<div class={cx(reviewGridClass, cardOffsetClass)}>
  {#each reviews as review (review.name)}
    <ReviewItem {review} />
  {/each}
</div>
