<script lang="ts">
  import { css, cx, keyframes } from "#styled-system/css/index.js";
  import { visuallyHidden } from "#styled-system/patterns/index.js";

  const violetDrift = keyframes({
    "0%": { transform: "translate(-2%, 2%) rotate(-11deg) scale(.94)" },
    "13%": { transform: "translate(7%, -8%) rotate(8deg) scale(1.08)" },
    "31%": { transform: "translate(-3%, -12%) rotate(-15deg) scale(.98)" },
    "53%": { transform: "translate(8%, 4%) rotate(13deg) scale(.91)" },
    "77%": { transform: "translate(-8%, 1%) rotate(-4deg) scale(1.1)" },
    "100%": { transform: "translate(3%, -5%) rotate(10deg) scale(.96)" },
  });

  const yellowDrift = keyframes({
    "0%": { transform: "translate(1%, -3%) rotate(7deg) scale(.92)" },
    "17%": { transform: "translate(-9%, 7%) rotate(-14deg) scale(1.1)" },
    "39%": { transform: "translate(-4%, -8%) rotate(11deg) scale(.98)" },
    "62%": { transform: "translate(8%, 5%) rotate(-8deg) scale(1.06)" },
    "81%": { transform: "translate(-5%, 11%) rotate(16deg) scale(.91)" },
    "100%": { transform: "translate(5%, -2%) rotate(-11deg) scale(1.03)" },
  });

  const sageDrift = keyframes({
    "0%": { transform: "translate(4%, 2%) rotate(-8deg) scale(1.02)" },
    "19%": { transform: "translate(-7%, -9%) rotate(12deg) scale(.9)" },
    "42%": { transform: "translate(-12%, 4%) rotate(-14deg) scale(1.1)" },
    "64%": { transform: "translate(5%, -7%) rotate(9deg) scale(.96)" },
    "83%": { transform: "translate(10%, 5%) rotate(-5deg) scale(1.08)" },
    "100%": { transform: "translate(-3%, 9%) rotate(13deg) scale(.93)" },
  });

  const artClass = css({
    aspectRatio: "1.12",
    isolation: "isolate",
    marginInline: "auto",
    maxInlineSize: "560px",
    position: "relative",
    width: "full",
    _supportsViewTimeline: {
      animationFillMode: "both",
      animationName: "fade-in, slide-in",
      animationRange: "entry 0% entry 32%, entry 0% entry 32%",
      animationTimeline: "view(block), view(block)",
      animationTimingFunction: "glide",
    },
    _motionReduce: { animation: "none" },
  });

  const posterClass = css({
    backgroundImage:
      "linear-gradient(140deg, color-mix(in srgb, var(--colors-feature-primary) 22%, transparent), color-mix(in srgb, var(--colors-warning) 18%, transparent) 56%, color-mix(in srgb, var(--colors-feature-primary) 20%, transparent))",
    clipPath: "polygon(12% 0, 91% 6%, 100% 44%, 84% 91%, 46% 100%, 0 71%)",
    inset: "11% 7% 9% 8%",
    position: "absolute",
    rotate: "2deg",
    zIndex: -1,
    _dark: {
      backgroundImage:
        "linear-gradient(140deg, color-mix(in srgb, var(--colors-primary) 18%, var(--colors-background)), color-mix(in srgb, var(--colors-warning) 12%, var(--colors-background)) 54%, color-mix(in srgb, var(--colors-feature-primary) 16%, var(--colors-background)))",
      opacity: 0.85,
    },
  });

  const orbClass = css({
    backgroundImage:
      "radial-gradient(ellipse at 52% 48%, color-mix(in srgb, var(--colors-background) 88%, var(--colors-feature-primary)) 0%, color-mix(in srgb, var(--colors-feature-primary) 15%, var(--colors-background)) 55%, color-mix(in srgb, var(--colors-warning) 8%, var(--colors-background)) 100%)",
    borderColor: "featurePrimary/25",
    borderRadius: "53% 47% 45% 55% / 43% 49% 51% 57%",
    borderStyle: "solid",
    borderWidth: 1,
    boxShadow: "0 28px 66px oklch(30% 0.08 300 / 13%)",
    inset: "9% 9% 8%",
    overflow: "hidden",
    position: "absolute",
    rotate: "-6deg",
    _dark: {
      backgroundImage:
        "radial-gradient(ellipse at 52% 48%, color-mix(in srgb, var(--colors-gray-800) 92%, var(--colors-primary)) 0%, color-mix(in srgb, var(--colors-gray-900) 91%, var(--colors-primary)) 60%, var(--colors-gray-950) 100%)",
      boxShadow: "0 28px 66px oklch(0% 0 0 / 45%)",
    },
  });

  const blobFieldClass = css({
    borderRadius: "inherit",
    inset: "-5%",
    overflow: "hidden",
    position: "absolute",
  });

  const glowBlobClass = css({
    borderRadius: "full",
    display: "block",
    filter: { base: "blur(18px)", smDown: "blur(13px)" },
    position: "absolute",
    willChange: "transform",
    _motionReduce: { animation: "none" },
  });

  const violetBlobClass = css({
    animation: `${violetDrift} 31s cubic-bezier(.48,.07,.42,.94) infinite alternate`,
    background:
      "radial-gradient(ellipse at 48% 48%, color-mix(in srgb, var(--colors-feature-primary) 92%, transparent) 0 18%, color-mix(in srgb, var(--colors-feature-primary) 74%, transparent) 39%, transparent 76%)",
    height: "52%",
    left: "5%",
    opacity: 0.82,
    top: "8%",
    width: "54%",
    _dark: { opacity: 0.72 },
  });

  const yellowBlobClass = css({
    animation: `${yellowDrift} 37s cubic-bezier(.37,.12,.58,.96) infinite alternate`,
    background:
      "radial-gradient(ellipse at 45% 48%, color-mix(in srgb, var(--colors-warning) 95%, transparent) 0 17%, color-mix(in srgb, var(--colors-warning) 67%, transparent) 42%, transparent 76%)",
    height: "42%",
    opacity: 0.82,
    right: "4%",
    top: "1%",
    width: "39%",
    _dark: { opacity: 0.67 },
  });

  const sageBlobClass = css({
    animation: `${sageDrift} 29s cubic-bezier(.52,.02,.37,.98) infinite alternate`,
    background:
      "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--colors-feature-success) 92%, transparent) 0 15%, color-mix(in srgb, var(--colors-feature-success) 67%, transparent) 40%, transparent 77%)",
    bottom: 0,
    height: "48%",
    opacity: 0.76,
    right: "3%",
    width: "46%",
    _dark: { opacity: 0.66 },
  });

  const innerHazeClass = css({
    backgroundColor: "background/65",
    borderRadius: "48% 52% 45% 55%",
    filter: "blur(20px)",
    height: "47%",
    left: "22%",
    position: "absolute",
    top: "28%",
    width: "56%",
    zIndex: 1,
  });

  const ringClass = css({
    height: "full",
    inset: 0,
    overflow: "visible",
    pointerEvents: "none",
    position: "absolute",
    width: "full",
    zIndex: 2,
    "& path": {
      fill: "none",
      stroke: "primary/60",
      strokeLinecap: "round",
      strokeWidth: 1.5,
      _dark: { stroke: "pastelPurple/80" },
    },
  });

  const stemClass = css({
    backgroundColor: "primary",
    borderRadius: "full",
    boxShadow:
      "22px 5px 0 -4px var(--colors-primary), -7px 20px 0 -4px var(--colors-primary)",
    height: 4,
    left: "14%",
    position: "absolute",
    top: "21%",
    width: 4,
    zIndex: 3,
    _dark: {
      backgroundColor: "pastelPurple",
      boxShadow:
        "22px 5px 0 -4px var(--colors-pastel-purple), -7px 20px 0 -4px var(--colors-pastel-purple), 0 0 13px var(--colors-pastel-purple)",
    },
  });

  const artWordsClass = css({
    color: "foreground",
    fontFamily: "sansserif",
    fontSize: { base: "5xl", sm: "6xl", lg: "7xl" },
    fontWeight: "black",
    left: "50%",
    letterSpacing: "tighter",
    lineHeight: "none",
    position: "absolute",
    textAlign: "center",
    textShadow:
      "0 2px 16px color-mix(in srgb, var(--colors-background) 70%, transparent)",
    top: "50%",
    transform: "translate(-50%, -50%) rotate(-7deg)",
    width: "55%",
    zIndex: 4,
  });

  const artGlowsClass = css({
    color: "primary",
    display: "inline-block",
    fontFamily: "handwriting",
    fontSize: "0.62em",
    fontWeight: "bold",
    letterSpacing: "tight",
    marginBlockStart: 1,
    _dark: { color: "warning" },
  });

  const badgeClass = css({
    backgroundColor: "warning",
    borderColor: "warning/70",
    borderRadius: "48% 52% 44% 56% / 52% 44% 56% 48%",
    borderStyle: "solid",
    borderWidth: 1,
    color: "warningForeground",
    fontFamily: "handwriting",
    fontSize: { base: "xs", md: "sm" },
    lineHeight: "tight",
    paddingBlock: 3,
    paddingInline: 4,
    position: "absolute",
    right: "3%",
    textAlign: "center",
    top: "17%",
    transform: "rotate(8deg)",
    zIndex: 5,
    _after: {
      borderColor: "white/80",
      borderRadius: "inherit",
      borderStyle: "solid",
      borderWidth: 1,
      content: '""',
      inset: 1,
      position: "absolute",
    },
  });

  const captionClass = css({
    bottom: "9%",
    color: "primary",
    fontFamily: "handwriting",
    fontSize: { base: "xs", md: "md" },
    left: "5%",
    position: "absolute",
    rotate: "-7deg",
    zIndex: 5,
    _dark: { color: "pastelPurple" },
  });

  const mobileArtClass = css({
    mdDown: {
      aspectRatio: "1.18",
      maxInlineSize: "540px",
      width: "full",
    },
    smDown: {
      aspectRatio: "1.16",
      marginBlockStart: 2,
      width: "full",
    },
  });

  const srOnlyClass = visuallyHidden();
</script>

<div
  aria-label="Good work glows, an abstract orbit of lilac, yellow, and sage light"
  class={cx(artClass, mobileArtClass)}
  role="img"
>
  <div aria-hidden="true" class={posterClass}></div>
  <div aria-hidden="true" class={orbClass}>
    <div class={blobFieldClass}>
      <span aria-hidden="true" class={cx(glowBlobClass, violetBlobClass)}
      ></span>
      <span aria-hidden="true" class={cx(glowBlobClass, yellowBlobClass)}
      ></span>
      <span aria-hidden="true" class={cx(glowBlobClass, sageBlobClass)}></span>
    </div>
    <div aria-hidden="true" class={innerHazeClass}></div>
    <svg
      aria-hidden="true"
      class={ringClass}
      preserveAspectRatio="none"
      viewBox="0 0 560 500"
    >
      <path d="M67 332C107 148 245 66 385 112c111 37 151 163 83 284"></path>
      <path d="M138 405C77 292 119 170 213 127"></path>
    </svg>
    <span aria-hidden="true" class={stemClass}></span>
    <span class={srOnlyClass}>Good work glows.</span>
    <p aria-hidden="true" class={artWordsClass}>
      good<br />work<br /><span class={artGlowsClass}>glows.</span>
    </p>
  </div>
  <div aria-hidden="true" class={badgeClass}>made with<br />care</div>
  <span aria-hidden="true" class={captionClass}>a softer kind of admin</span>
</div>
