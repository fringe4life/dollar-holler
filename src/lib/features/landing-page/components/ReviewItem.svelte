<script lang="ts">
  import { StarIcon } from "@lucide/svelte";
  import { css, cx } from "#styled-system/css/index.js";
  import {
    circle,
    flex,
    hstack,
    stack,
  } from "#styled-system/patterns/index.js";
  import type { reviews } from "#features/landing-page/constants/reviews.ts";

  interface Props {
    review: (typeof reviews)[number];
  }

  let { review }: Props = $props();

  const reviewRevealClass = css({
    display: "flex",
    inlineSize: "full",
    _supportsViewTimeline: {
      "--rotate-distance": {
        _even: "-2deg",
        _odd: "2deg",
      },
      "--slide-distance": {
        _even: "var(--spacing-8)",
        _odd: "calc(var(--spacing-8) * -1)",
      },
      animationFillMode: "both",
      animationName:
        "fade-in, fade-out, slide-in, slide-out-reverse, rotate-reveal",
      animationRange:
        "entry 0% entry 100%, exit 0% exit 100%, entry 0% entry 100%, exit 0% exit 100%, entry 0% exit 100%",
      animationTimeline: "view(block)",
      animationTimingFunction: "glide",
    },
  });
</script>

<div class={reviewRevealClass}>
  <div
    class={cx(
      stack({
        flex: 1,
        gap: 5,
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
        _hover: { scale: 1.02 },
      }),
      review.rotate
    )}
  >
    <!-- Stars -->
    <div class={flex({ gap: 1 })}>
      {#each { length: 5 } as _, i (i)}
        <StarIcon class={css({ color: "goldenFizz" })} size={16} />
      {/each}
    </div>

    <!-- Quote -->
    <p class={css({ flex: 1, lineHeight: "relaxed", color: "white/90" })}>
      "{review.quote}"
    </p>

    <!-- Reviewer -->
    <div class={hstack({ gap: 3 })}>
      <img
        alt={review.name}
        class={cx(
          circle({ size: 11 }),
          css({ objectFit: "cover", ring: 2, ringColor: "white/20" })
        )}
        height="44"
        src={review.avatar}
        width="44"
      />
      <div>
        <p
          class={css({
            fontFamily: "sansserif",
            fontSize: "sm",
            fontWeight: "bold",
            color: "white",
          })}
        >
          {review.name}
        </p>
        <p class={css({ color: "pastelPurple", fontSize: "xs" })}>
          {review.role}
        </p>
      </div>
    </div>
  </div>
</div>
