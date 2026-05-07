<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { flex, square, stack } from "styled-system/patterns";
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

<!-- // class={[
  //   "group after:ease-glide supports-linear:ease-anticipate relative flex flex-col gap-4 rounded-2xl border p-6 transition-[translate] duration-200 after:absolute after:inset-0  after:rounded-[inherit] after:opacity-0 after:shadow-lg after:transition-opacity after:duration-200 hover:-translate-y-1 hover:after:opacity-100",
  //   feature.accent,
  //   feature.border,
  // ].join(" ")} -->
<div
  class={cx("group", stack({ gap: 4 }),
            css({
              position: "relative", 
              rounded: "2xl", 
              borderWidth: "1px",
              borderStyle: "solid",
              padding: 6, 
              transitionProperty: "translate", 
              transitionDuration: "normal",
              _after: {
                position: "absolute",
                inset: "0",
                rounded: "inherit",
                opacity: "0",
                shadow: "lg",
                transitionProperty: ["opacity", "translate"],
                transitionDuration: "normal",
                content: "''",
                _supportsLinear: {
                  transitionTimingFunction: "anticipate",
                },
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
            flex({ align: "center", justify: "center" }),
            square({ size: 12 }),
            css({  rounded: "xl", }), feature.iconBg 
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
