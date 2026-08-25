<script lang="ts" module>
  import { cx, sva, type RecipeVariant } from "#styled-system/css/index.js";
  import type { HTMLButtonAttributes } from "svelte/elements";

  const navbarMenuButton = sva({
    base: {
      button: {
        blockSize: 12,
        cursor: "pointer",
        display: { md: "none" },
        insetBlockStart: 6,
        insetInlineEnd: 6,
        padding: 2,
        transitionDuration: "normal",
        transitionProperty: "colors",
        zIndex: 10_000,
      },
      icon: {
        "&::after,&::before,&": {
          backgroundColor: "currentColor",
          blockSize: "5px",
          borderRadius: "3px",
          content: "''",
          display: "block",
          inlineSize: "32px",
          transitionDuration: "normal",
          transitionProperty: ["rotate", "translate", "opacity"],
        },
      },
    },
    slots: ["button", "icon"],
    variants: {
      state: {
        close: {
          button: {
            color: "goldenFizz",
            position: "absolute",
          },
          icon: {
            rotate: "45deg",
            _after: { rotate: "-90deg", translate: "0 -3px" },
            _before: { opacity: 0, translate: "0 -10px" },
            _starting: {
              _after: { rotate: "0deg", translate: "0 5px" },
              _before: { opacity: 1 },
              rotate: "0deg",
            },
          },
        },
        open: {
          button: {
            color: "daisyBush",
            position: "fixed",
          },
          icon: {
            _after: { translate: "0 5px" },
            _before: { translate: "0 -10px" },
          },
        },
      },
    },
  });

  export type NavbarMenuButtonState = RecipeVariant<
    typeof navbarMenuButton
  >["state"];
  export type NavbarMenuButtonProps = Omit<
    HTMLButtonAttributes,
    "class" | "style" | "type"
  > & {
    "aria-label": string;
    class?: string;
    state: NavbarMenuButtonState;
  };
</script>

<script lang="ts">
  let {
    class: className,
    state,
    ...restProps
  }: NavbarMenuButtonProps = $props();
  const controls = $derived(navbarMenuButton({ state }));
</script>

<button class={cx(controls.button, className)} type="button" {...restProps}>
  <span class={controls.icon}></span>
</button>
