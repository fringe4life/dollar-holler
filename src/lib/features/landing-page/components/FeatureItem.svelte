<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import {
    center,
    hoverShadow,
    square,
    stack,
  } from "#styled-system/patterns/index.js";
  import type { Component } from "svelte";
  import type { features } from "#features/landing-page/constants/features.ts";
  import type { IconProps } from "#lib/components/primitives/Icon.svelte";

  export interface Feature {
    icon: Component<IconProps>;
  }

  interface Props {
    feature: (typeof features)[number];
  }

  let { feature }: Props = $props();

  const Icon = $derived(feature.icon);

  const featureRevealClass = css({
    display: "flex",
    inlineSize: "full",
    _supportsViewTimeline: {
      "--slide-distance": {
        _even: "var(--spacing-8)",
        _odd: "calc(var(--spacing-8) * -1)",
      },
      animationFillMode: "both",
      animationName: "fade-in, fade-out, slide-in, slide-out-reverse",
      animationRange:
        "entry 0% entry 100%, exit 0% exit 100%, entry 0% entry 100%, exit 0% exit 100%",
      animationTimeline: "view(block)",
      animationTimingFunction: "glide",
    },
  });
</script>

<div class={featureRevealClass}>
  <div
    class={cx(
      "group",
      stack({
        flex: 1,
        gap: 4,
        rounded: "2xl",
        borderWidth: 1,
        borderStyle: "solid",
        padding: 6,
        transitionProperty: "translate",
        transitionDuration: "normal",
        transitionTimingFunction: {
          base: "ease-out",
          _supportsLinear: "glide",
        },
        _hover: {
          translate: "0 -1px",
        },
      }),
      hoverShadow({ shadow: "lg" }),
      feature.accent,
      feature.border
    )}
  >
    <div
      class={cx(
        center({ rounded: "xl" }),
        square({ size: 12 }),
        feature.iconBg
      )}
    >
      <Icon class={feature.iconColor} size={24} />
    </div>
    <div>
      <h3
        class={css({
          color: "daisyBush",
          marginBlockEnd: 2,
          fontSize: "lg",
          fontWeight: "black",
        })}
      >
        {feature.title}
      </h3>
      <p
        class={css({
          fontSize: "sm",
          lineHeight: "relaxed",
          color: "stone.600",
        })}
      >
        {feature.description}
      </p>
    </div>
  </div>
</div>
