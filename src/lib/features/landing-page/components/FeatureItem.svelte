<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { center, flex, square, stack } from "styled-system/patterns";
  import type { Component } from "svelte";
  import type { features } from "$features/landing-page/constants/features.js";
  import type { IconProps } from "$lib/components/Icon.svelte";

  export interface Feature {
    icon: Component<IconProps>;
  }

  interface Props {
    feature: (typeof features)[number];
  }

  let { feature }: Props = $props();

  const Icon = $derived(feature.icon);
</script>
<div
  class={cx("group",
          stack({
              gap: 4,
              position: "relative",
              rounded: "2xl",
              borderWidth: "1px",
              borderStyle: "solid",
              padding: 6,
              transitionProperty: "translate",
              transitionDuration: "normal",
              transitionTimingFunction: {_supportsLinear: "glide"},
              _after: {
                position: "absolute",
                inset: "0",
                rounded: "inherit",
                opacity: "0",
                shadow: "lg",
                transitionProperty: "opacity",
                transitionDuration: "normal",
                content: "''",
              },
              _hover: {
                  translate: "0 -1px",
                  _after: {
                    opacity: "1",
                  },
              }
  }), feature.accent, feature.border)}
>
  <div
    class={cx(
            center({ rounded: "xl", }),
            square({ size: 12 }),
            feature.iconBg
          )}
  >
    <Icon size={24} class={feature.iconColor} />
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
