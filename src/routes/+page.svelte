<script lang="ts">
  import { ArrowUpRightIcon } from "@lucide/svelte";
  import { css, cx } from "#styled-system/css/index.js";
  import { grid, hstack, stack } from "#styled-system/patterns/index.js";
  import { asset, resolve } from "$app/paths";
  import Features from "#features/landing-page/components/Features.svelte";
  import GlowingOrb from "#features/landing-page/components/GlowingOrb.svelte";
  import LandingNav from "#features/landing-page/components/LandingNav.svelte";
  import Reviews from "#features/landing-page/components/Reviews.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { directionalArrow } from "#lib/styles.ts";

  let { data } = $props();

  const arrowClass = cx(
    css({ flexShrink: 0, height: 4, width: 4 }),
    directionalArrow({ direction: "forward" })
  );

  const pageClass = css({
    backgroundColor: "background",
    color: "foreground",
    overflow: "clip",
  });

  const heroSectionClass = css({
    backgroundColor: "background",
    backgroundImage:
      "radial-gradient(ellipse at 79% 37%, color-mix(in srgb, var(--colors-warning) 21%, transparent), transparent 28%), radial-gradient(ellipse at 9% 13%, color-mix(in srgb, var(--colors-feature-primary) 18%, transparent), transparent 42%), linear-gradient(115deg, var(--colors-background) 20%, color-mix(in srgb, var(--colors-feature-primary) 5%, var(--colors-background)) 61%, color-mix(in srgb, var(--colors-warning) 7%, var(--colors-background)))",
    clipPath:
      "polygon(0 0, 100% 0, 100% 91%, 87% 95%, 70% 92%, 53% 100%, 35% 95%, 17% 99%, 0 93%)",
    isolation: "isolate",
    overflow: "clip",
    paddingBlockEnd: { base: 24, md: 32 },
    paddingBlockStart: { base: 8, md: 10 },
    position: "relative",
    _dark: {
      backgroundImage:
        "radial-gradient(ellipse at 79% 37%, color-mix(in srgb, var(--colors-warning) 10%, transparent), transparent 30%), radial-gradient(ellipse at 12% 10%, color-mix(in srgb, var(--colors-feature-primary) 20%, transparent), transparent 42%), linear-gradient(125deg, var(--colors-background), color-mix(in srgb, var(--colors-primary) 8%, var(--colors-background)) 54%, var(--colors-background))",
      clipPath:
        "polygon(0 0, 100% 0, 100% 89%, 84% 95%, 65% 91%, 47% 100%, 28% 95%, 12% 98%, 0 91%)",
    },
    smDown: {
      clipPath:
        "polygon(0 0, 100% 0, 100% 94%, 82% 98%, 63% 94%, 45% 100%, 27% 96%, 12% 99%, 0 95%)",
    },
  });

  const heroLayoutClass = grid({
    alignItems: "center",
    columns: { base: 1, lg: 2 },
    gap: { base: 5, md: 12, lg: 16 },
    marginInline: "auto",
    maxInlineSize: "6xl",
    paddingInline: { base: 5, md: 6 },
  });

  const heroCopyClass = stack({ align: "start", gap: { base: 4, md: 5 } });

  const kickerClass = css({
    alignItems: "center",
    color: "primary",
    display: "inline-flex",
    fontSize: { base: "xs", md: "sm" },
    fontWeight: "bold",
    gap: 2.5,
    letterSpacing: "widest",
    marginBlockEnd: 1,
    textTransform: "uppercase",
    _before: {
      backgroundColor: "warning",
      borderColor: "warning/60",
      borderRadius: "full",
      borderStyle: "solid",
      borderWidth: 1,
      content: '""',
      flexShrink: 0,
      height: 3,
      width: 3,
    },
  });

  const heroTitleClass = css({
    color: "foreground",
    fontFamily: "sansserif",
    fontSize: { base: "5xl", sm: "6xl", md: "6xl", lg: "7xl" },
    fontWeight: "black",
    letterSpacing: "tighter",
    lineHeight: "none",
    maxInlineSize: "10ch",
    margin: 0,
    _dark: {
      color: "foreground",
    },
  });

  const highlightClass = css({
    color: "primary",
    display: "inline-block",
    position: "relative",
    whiteSpace: "nowrap",
    zIndex: 0,
    _after: {
      backgroundColor: "warning",
      borderRadius: "full",
      content: '""',
      height: 3,
      insetBlockEnd: 0.5,
      insetInline: "-2%",
      opacity: 0.7,
      position: "absolute",
      rotate: "-2deg",
      zIndex: -1,
    },
    _dark: {
      color: "warning",
      _after: { backgroundColor: "primary/50" },
    },
  });

  const heroLedeClass = css({
    color: "linkMuted",
    fontSize: { base: "md", md: "lg" },
    lineHeight: "relaxed",
    marginBlock: { base: 4, md: 5 },
    maxInlineSize: "46ch",
  });

  const heroActionsClass = hstack({
    alignItems: "center",
    flexWrap: "wrap",
    gap: { base: 3, md: 4 },
  });

  const primaryButtonClass = css({
    borderRadius: "full",
    boxShadow: "colored",
    paddingBlock: { base: 2.5, md: 3 },
    paddingInline: { base: 5, md: 6 },
    _hover: { rotate: "-1deg", translate: "0 -2px" },
  });

  const heroNoteClass = css({
    color: "textMuted",
    fontFamily: "handwriting",
    fontSize: { base: "sm", md: "md" },
    marginBlockStart: 2,
    marginInlineStart: 1,
    rotate: "-2deg",
  });

  const heroLoginClass = css({
    color: "linkMuted",
    fontSize: "sm",
    fontWeight: "bold",
    textDecoration: "underline",
    textDecorationColor: "primary/40",
    textUnderlineOffset: 4,
    _hover: { color: "primary" },
    _focusVisible: {
      outlineColor: "ring",
      outlineOffset: 3,
      outlineStyle: "solid",
      outlineWidth: 2,
    },
  });

  const reviewSectionClass = css({
    backgroundColor: "landingReview",
    backgroundImage:
      "radial-gradient(ellipse at 88% 7%, color-mix(in srgb, var(--colors-feature-primary) 24%, transparent), transparent 27%), linear-gradient(125deg, var(--colors-landing-review), color-mix(in srgb, var(--colors-landing-review) 92%, var(--colors-primary)))",
    clipPath:
      "polygon(0 4%, 12% 0, 28% 3%, 47% 0, 67% 4%, 86% 1%, 100% 4%, 100% 95%, 87% 100%, 68% 96%, 47% 100%, 27% 96%, 9% 100%, 0 96%)",
    isolation: "isolate",
    overflow: "clip",
    paddingBlock: { base: 20, md: 28 },
    position: "relative",
    _dark: {
      backgroundImage:
        "radial-gradient(ellipse at 88% 7%, color-mix(in srgb, var(--colors-feature-primary) 22%, transparent), transparent 30%), linear-gradient(125deg, var(--colors-landing-review), color-mix(in srgb, var(--colors-landing-review) 83%, var(--colors-gray-950)))",
      clipPath:
        "polygon(0 3%, 16% 0, 35% 4%, 54% 0, 74% 3%, 100% 1%, 100% 96%, 84% 100%, 61% 96%, 40% 100%, 19% 96%, 0 100%)",
    },
    smDown: {
      clipPath:
        "polygon(0 2%, 20% 0, 43% 3%, 68% 0, 100% 2%, 100% 97%, 78% 100%, 53% 97%, 29% 100%, 0 97%)",
    },
  });

  const sectionContainerClass = css({
    marginInline: "auto",
    maxInlineSize: "6xl",
    paddingInline: { base: 5, md: 6 },
    position: "relative",
  });

  const reviewHeadClass = css({
    alignItems: { base: "start", md: "end" },
    display: "flex",
    flexDirection: { base: "column", md: "row" },
    gap: { base: 3, md: 8 },
    justifyContent: "space-between",
    marginBlockEnd: { base: 8, md: 12 },
  });

  const reviewEyebrowClass = css({
    color: "warning",
    fontSize: "xs",
    fontWeight: "bold",
    letterSpacing: "widest",
    marginBlockEnd: 2,
    textTransform: "uppercase",
  });

  const reviewTitleClass = css({
    color: "foregroundInverse",
    fontFamily: "sansserif",
    fontSize: { base: "4xl", sm: "5xl", md: "6xl" },
    fontWeight: "black",
    letterSpacing: "tight",
    lineHeight: "tight",
    margin: 0,
    whiteSpace: { base: "normal", md: "nowrap" },
  });

  const reviewIntroClass = css({
    color: "foregroundInverse/85",
    fontSize: { base: "sm", md: "md" },
    lineHeight: "relaxed",
    margin: 0,
    maxInlineSize: "32ch",
  });

  const footerClass = css({
    backgroundColor: "background",
    backgroundImage:
      "linear-gradient(115deg, color-mix(in srgb, var(--colors-warning) 13%, var(--colors-background)), color-mix(in srgb, var(--colors-feature-primary) 10%, var(--colors-background)) 52%, var(--colors-background))",
    clipPath:
      "polygon(0 6%, 12% 0, 31% 5%, 49% 0, 68% 6%, 85% 1%, 100% 6%, 100% 96%, 83% 100%, 62% 96%, 42% 100%, 19% 96%, 0 100%)",
    paddingBlock: { base: 7, md: 9 },
    position: "relative",
    _dark: {
      backgroundImage:
        "linear-gradient(115deg, color-mix(in srgb, var(--colors-warning) 6%, var(--colors-background)), color-mix(in srgb, var(--colors-primary) 12%, var(--colors-background)) 52%, var(--colors-background))",
    },
    smDown: {
      clipPath:
        "polygon(0 3%, 22% 0, 45% 3%, 70% 0, 100% 3%, 100% 97%, 74% 100%, 48% 97%, 23% 100%, 0 97%)",
    },
  });

  const footerInnerClass = css({
    alignItems: { base: "start", sm: "center" },
    display: "flex",
    flexDirection: { base: "column", sm: "row" },
    gap: { base: 3, sm: 5 },
    justifyContent: "space-between",
    marginInline: "auto",
    maxInlineSize: "6xl",
    minBlockSize: { sm: 20 },
    paddingBlockStart: 4,
    paddingInline: { base: 5, md: 6 },
  });

  const footerBrandClass = hstack({
    color: "foreground",
    fontFamily: "sansserif",
    fontSize: "md",
    fontWeight: "black",
    gap: 2.5,
  });

  const footerLogoClass = css({
    height: 8,
    objectFit: "contain",
    width: 8,
  });

  const footerTagClass = css({
    color: "textMuted",
    fontFamily: "handwriting",
    fontSize: "sm",
    margin: 0,
  });

  const footerLinksClass = hstack({
    flexWrap: "wrap",
    gap: { base: 3, md: 5 },
  });
</script>

<svelte:head>
  <title>Dollar Holler — Invoicing with a little less admin</title>
  <meta
    content="Create invoices, keep client details close, and set invoice statuses when you're ready. Dollar Holler records your status—it doesn't process payments."
    name="description"
  />
</svelte:head>

<div class={pageClass}>
  <LandingNav user={data?.user} />

  <main>
    <section aria-labelledby="hero-title" class={heroSectionClass} id="top">
      <div class={heroLayoutClass}>
        <div class={heroCopyClass}>
          <p class={kickerClass}>A little more room to make</p>
          <h1 class={heroTitleClass} id="hero-title">
            Make it.<br />
            Send it.<br />
            <span class={highlightClass}>Get back</span><br />
            to making.
          </h1>
          <p class={heroLedeClass}>
            Create invoices, keep client details close, and decide when each one
            moves from draft to sent to paid.
          </p>
          <div class={heroActionsClass}>
            <Button
              class={cx("group", primaryButtonClass)}
              href={resolve(data?.user ? "invoices" : "signup")}
              size="lg"
            >
              {data?.user ? "Go to your invoices" : "Create your account"}
              <ArrowUpRightIcon aria-hidden="true" class={arrowClass} />
            </Button>
            {#if !data?.user}
              <a class={heroLoginClass} href={resolve("login")}
                >Already have an account?</a
              >
            {/if}
          </div>
          <p class={heroNoteClass}>For the work you love doing.</p>
        </div>
        <GlowingOrb />
      </div>
    </section>

    <Features />

    <section
      aria-labelledby="reviews-title"
      class={reviewSectionClass}
      id="reviews"
    >
      <div class={sectionContainerClass}>
        <div class={reviewHeadClass}>
          <div>
            <p class={reviewEyebrowClass}>Illustrative sample reviews</p>
            <h2 class={reviewTitleClass} id="reviews-title">
              A few kind words.
            </h2>
          </div>
          <p class={reviewIntroClass}>
            Good work is worth sharing. Here are a couple of notes from the
            creative day.
          </p>
        </div>
        <Reviews />
      </div>
    </section>
  </main>

  <footer class={footerClass}>
    <div class={footerInnerClass}>
      <a
        aria-label="Dollar Holler home"
        class={footerBrandClass}
        href={resolve("/")}
      >
        <img
          alt=""
          class={footerLogoClass}
          height="32"
          src={asset("images/logo.svg")}
          width="32"
        />
        <span>Dollar Holler</span>
      </a>
      <p class={footerTagClass}>More making. Less muddle.</p>
      <nav aria-label="Footer navigation" class={footerLinksClass}>
        {#if data?.user}
          <a class={heroLoginClass} href={resolve("invoices")}>Invoices</a>
          <a class={heroLoginClass} href={resolve("clients")}>Clients</a>
        {:else}
          <a class={heroLoginClass} href={resolve("login")}>Log in</a>
          <Button class={primaryButtonClass} href={resolve("signup")} size="sm">
            Create an account
            <ArrowUpRightIcon aria-hidden="true" class={arrowClass} />
          </Button>
        {/if}
      </nav>
    </div>
  </footer>
</div>
