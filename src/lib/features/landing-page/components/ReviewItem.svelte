<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { reviews } from "#features/landing-page/constants/reviews.ts";

  interface Props {
    review: (typeof reviews)[number];
  }

  let { review }: Props = $props();

  const reviewRevealClass = css({
    borderRadius: "26px 9px 24px 9px",
    boxShadow: "lg",
    display: "flex",
    flexDirection: "column",
    inlineSize: "full",
    justifyContent: "space-between",
    minBlockSize: { base: 48, md: 56 },
    padding: { base: 5, md: 7 },
    transitionDuration: "normal",
    transitionProperty: "translate, rotate",
    _hover: { translate: "0 -2px" },
    _supportsViewTimeline: {
      "--rotate-distance": {
        _even: "-1deg",
        _odd: "1deg",
      },
      "--slide-distance": {
        _even: "var(--spacing-6)",
        _odd: "calc(var(--spacing-6) * -1)",
      },
      animationFillMode: "both",
      animationName: "fade-in, slide-in, rotate-reveal",
      animationRange:
        "entry 0% entry 100%, entry 0% entry 100%, entry 0% entry 100%",
      animationTimeline: "view(block), view(block), view(block)",
      animationTimingFunction: "glide",
    },
    _motionReduce: {
      animation: "none",
      transitionDuration: "0.01ms",
    },
  });

  const quoteClass = css({
    color: "landingQuoteText",
    fontFamily: "sansserif",
    fontSize: { base: "xl", md: "2xl" },
    fontWeight: "bold",
    letterSpacing: "tight",
    lineHeight: "snug",
    margin: 0,
  });

  const bylineClass = css({
    color: "landingQuoteMuted",
    fontSize: "sm",
    fontWeight: "bold",
    marginBlockStart: 5,
  });
</script>

<figure class={cx(reviewRevealClass, review.surface, review.rotate)}>
  <blockquote class={quoteClass}>“{review.quote}”</blockquote>
  <figcaption class={bylineClass}>{review.name} · {review.role}</figcaption>
</figure>
