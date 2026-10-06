<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { features } from "#features/landing-page/constants/features.ts";

  interface Props {
    feature: (typeof features)[number];
  }

  let { feature }: Props = $props();

  const revealClass = css({
    borderBlockStartColor: "primary/35",
    borderBlockStartStyle: "solid",
    borderBlockStartWidth: 1,
    display: "flex",
    flexDirection: "column",
    inlineSize: "full",
    minBlockSize: { md: 44 },
    paddingBlockStart: 5,
    _supportsViewTimeline: {
      "--slide-distance": {
        _even: "var(--spacing-6)",
        _odd: "calc(var(--spacing-6) * -1)",
      },
      animationFillMode: "both",
      animationName: "fade-in, slide-in",
      animationRange: "entry 0% entry 100%, entry 0% entry 100%",
      animationTimeline: "view(block), view(block)",
      animationTimingFunction: "glide",
    },
    _motionReduce: { animation: "none" },
  });

  const markClass = css({
    borderRadius: "full",
    display: "block",
    height: 1.5,
    marginBlockEnd: 4,
    rotate: "-3deg",
    width: 12,
  });

  const titleClass = css({
    color: "foreground",
    fontFamily: "sansserif",
    fontSize: "lg",
    fontWeight: "black",
    letterSpacing: "tight",
    lineHeight: "tight",
    marginBlockEnd: 2,
  });

  const descriptionClass = css({
    color: "linkMuted",
    fontSize: "md",
    lineHeight: "relaxed",
    maxInlineSize: "36ch",
  });
</script>

<article class={cx(revealClass, feature.offset)}>
  <span aria-hidden="true" class={cx(markClass, feature.mark)}></span>
  <h3 class={titleClass}>{feature.title}</h3>
  <p class={descriptionClass}>{feature.description}</p>
</article>
