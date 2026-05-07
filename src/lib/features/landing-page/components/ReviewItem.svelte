<script lang="ts">
  import { StarIcon } from "@lucide/svelte";
  import { css, cx } from "styled-system/css";
  import { circle, flex, stack } from "styled-system/patterns";
  import type { reviews } from "$features/landing-page/constants/reviews.js";

  interface Props {
    review: (typeof reviews)[number];
  }

  let { review }: Props = $props();
</script>

<div
  class={cx(
    stack({ gap: 5 }), 
    css({ 
      rounded: "2xl", 
      borderWidth: "1px", 
      borderStyle: "solid", 
      borderColor: "white/10", 
      backgroundColor: "white/8", 
      padding: 6, 
      transitionProperty: "scale", 
      transitionDuration: "normal", 
      backdropFilter: "auto",
      backdropBlur: "sm",
      _hover: { scale: 1.02 }
    }), 
    review.rotate
  )}
>
  <!-- Stars -->
  <div class={flex({ gap: 1 })}>
    {#each { length: 5 } as _}
      <StarIcon size={16} class={css({ color: "goldenFizz" })} />
    {/each}
  </div>

  <!-- Quote -->
  <p class={css({ flex: 1, lineHeight: "relaxed", color: "white/90" })}>
    "{review.quote}"
  </p>

  <!-- Reviewer -->
  <div class={flex({ align: "center", gap: 3 })}>
    <img
      src={review.avatar}
      alt={review.name}
      class={cx(circle({ size: 11 }), css({objectFit: "cover", ring: 2, ringColor: "white/20"}))}
      width="44"
      height="44"
    >
    <div>
      <p
        class={css({ fontFamily: "sansserif", fontSize: "sm", fontWeight: "bold", color: "white" })}
      >
        {review.name}
      </p>
      <p class={css({ color: "pastelPurple", fontSize: "xs" })}>
        {review.role}
      </p>
    </div>
  </div>
</div>
