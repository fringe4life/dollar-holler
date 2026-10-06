<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { grid } from "#styled-system/patterns/index.js";
  import { features } from "#features/landing-page/constants/features.ts";
  import FeatureItem from "./FeatureItem.svelte";

  const sectionClass = css({
    backgroundColor: "surfaceSecondary",
    backgroundImage:
      "linear-gradient(118deg, color-mix(in srgb, var(--colors-feature-primary) 10%, var(--colors-background)), color-mix(in srgb, var(--colors-warning) 8%, var(--colors-background)) 54%, color-mix(in srgb, var(--colors-feature-primary) 7%, var(--colors-background)))",
    clipPath:
      "polygon(0 3%, 12% 0, 29% 3%, 46% 0, 63% 3%, 81% 0, 100% 2.5%, 100% 96%, 85% 100%, 68% 96%, 47% 100%, 26% 96%, 9% 100%, 0 97%)",
    marginBlockStart: -1,
    paddingBlock: { base: 20, md: 28 },
    position: "relative",
    _dark: {
      backgroundImage:
        "linear-gradient(125deg, color-mix(in srgb, var(--colors-primary) 12%, var(--colors-gray-900)), color-mix(in srgb, var(--colors-gray-900) 93%, var(--colors-warning)) 51%, color-mix(in srgb, var(--colors-primary) 11%, var(--colors-gray-900)))",
      clipPath:
        "polygon(0 2%, 17% 0, 34% 3%, 52% 0, 75% 3%, 100% 0, 100% 97%, 81% 100%, 59% 96%, 38% 100%, 18% 96%, 0 99%)",
    },
    smDown: {
      clipPath:
        "polygon(0 2%, 18% 0, 39% 2.5%, 60% 0, 82% 2%, 100% 0, 100% 97%, 80% 100%, 57% 97%, 34% 100%, 14% 97%, 0 100%)",
    },
    _before: {
      backgroundImage:
        "linear-gradient(90deg, var(--colors-primary) 0 18%, var(--colors-warning) 18% 33%, var(--colors-feature-primary) 33% 52%, var(--colors-warning) 52% 70%, var(--colors-primary) 70% 100%)",
      clipPath:
        "polygon(0 40%, 13% 0, 28% 66%, 46% 13%, 63% 56%, 80% 0, 100% 44%, 100% 100%, 0 100%)",
      content: '""',
      height: 3,
      insetBlockStart: 0,
      insetInline: 0,
      opacity: 0.55,
      position: "absolute",
    },
  });

  const containerClass = css({
    marginInline: "auto",
    maxInlineSize: "6xl",
    paddingInline: { base: 5, md: 6 },
    position: "relative",
  });

  const introClass = css({
    alignItems: { base: "start", md: "end" },
    display: "flex",
    flexDirection: { base: "column", md: "row" },
    gap: { base: 4, md: 8 },
    justifyContent: "space-between",
    marginBlockEnd: { base: 8, md: 12 },
  });

  const eyebrowClass = css({
    color: "primary",
    fontFamily: "handwriting",
    fontSize: { base: "md", md: "lg" },
    marginBlockEnd: 2,
    rotate: "-3deg",
  });

  const headingClass = css({
    color: "foreground",
    fontFamily: "sansserif",
    fontSize: { base: "4xl", sm: "5xl", md: "6xl" },
    fontWeight: "black",
    letterSpacing: "tighter",
    lineHeight: "tight",
    margin: 0,
    maxInlineSize: "12ch",
  });

  const headingHighlightClass = css({ color: "primary" });

  const introTextClass = css({
    color: "linkMuted",
    fontSize: { base: "md", md: "lg" },
    lineHeight: "relaxed",
    margin: 0,
    maxInlineSize: "35ch",
  });

  const featuresGridClass = grid({
    columns: { base: 1, md: 3 },
    gap: { base: 7, md: 8, lg: 10 },
  });

  const statusNoteClass = css({
    color: "textMuted",
    fontSize: "sm",
    marginBlockStart: { base: 7, md: 8 },
    maxInlineSize: "72ch",
  });
</script>

<section aria-labelledby="feature-title" class={sectionClass} id="features">
  <div class={containerClass}>
    <div class={introClass}>
      <div>
        <p class={eyebrowClass}>The everyday stuff, handled.</p>
        <h2 class={headingClass} id="feature-title">
          The business bits,<br />
          <span class={headingHighlightClass}>a little easier.</span>
        </h2>
      </div>
      <p class={introTextClass}>
        Keep the everyday details together, and leave more room for the work you
        came to do.
      </p>
    </div>
    <div class={featuresGridClass}>
      {#each features as feature (feature.title)}
        <FeatureItem {feature} />
      {/each}
    </div>
    <p class={cx(statusNoteClass)}>
      Dollar Holler records the status you set; it doesn’t process payments.
    </p>
  </div>
</section>
