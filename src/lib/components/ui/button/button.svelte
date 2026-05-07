<script lang="ts" module>
  import { cva, cx, type RecipeVariant } from "styled-system/css";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";

  export const buttonVariants = cva({
    base: {
      display: "inline-flex",
      cursor: "pointer",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      whiteSpace: "nowrap",
      rounded: "lg",
      fontFamily: "sansserif",
    },
    variants: {
      variant: {
        default: {
          position: "relative",
          backgroundColor: "lavenderIndigo",
          fontWeight: "black",
          color: "white",
          transitionProperty: "translate",
          transitionDuration: "normal",
          transitionTimingFunction: "anticipate",
          _after: {
            position: "absolute",
            content: "''",
            inset: 0,
            rounded: "inherit",
            opacity: "0",
            shadow: "lg",
            transitionProperty: "opacity",
            transitionDuration: "normal",
          },
          _hover: {
            translate: "-2px -2px",
            _after: {
              opacity: "1",
            },
          },
        },
        destructive: {
          backgroundColor: { base: "scarlet", _hover: "scarlet/90" },
          color: "goldenFizz",
          shadow: "xs",
          transitionProperty: "colors",
          transitionDuration: "normal",
        },
        auth: {
          inlineSize: "full",
          minBlockSize: 14,
          position: "relative",
          rounded: "lg",
          backgroundColor: "robinEggBlue",
          paddingInline: 4,
          paddingBlock: 3,
          fontWeight: "bold",
          color: "daisyBush",
          fontSize: "xl",
          transitionProperty: "translate",
          transitionDuration: "normal",
          _after: {
            position: "absolute",
            content: "''",
            inset: 0,
            rounded: "inherit",
            opacity: "0",
            shadow: "lg",
            transitionProperty: "opacity",
            transitionDuration: "normal",
          },
          _supportsLinear: {
            transitionTimingFunction: "glide",
          },
          _hover: {
            translate: "0 -4px",
            _after: {
              opacity: "1",
            },
          },
        },
        ghost: {
          color: { base: "pastelPurple", _hover: "blueGem" },
          shadow: "xs",
          transitionProperty: "colors",
          transitionDuration: "normal",
        },
        outline: {
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: "daisyBush",
          color: { base: "daisyBush", _hover: "white" },
          transitionProperty: "colors",
          transitionDuration: "normal",
          backgroundColor: { base: "transparent", _hover: "daisyBush/90" },
          _disabled: {
            borderColor: "red.500",
            color: "red.500",
            backgroundColor: "transparent",
            cursor: "not-allowed",
            _hover: {
              borderColor: "red.500",
              color: "red.500",
              backgroundColor: "transparent",
            },
          },
        },
        textOnlyDestructive: {
          backgroundColor: "transparent",
          paddingInline: 0,
          color: "scarlet",
          textDecoration: "underline",
          _hover: {
            textDecoration: "none",
          },
        },
        textOnly: {
          backgroundColor: "transparent",
          color: "lavenderIndigo",
          textDecoration: "none",
          _hover: {
            textDecoration: "underline",
          },
        },
        secondary: {
          backgroundColor: "gallery/80",
          fontWeight: "bold",
          color: "blueGem/90",
          shadow: "colored",
          transitionProperty: "colors",
          transitionDuration: "normal",
          _hover: {
            backgroundColor: "gallery",
            color: "blueGem",
          },
        },
        link: {
          color: "primary",
          textDecoration: "underline",
          textUnderlineOffset: 4,
          _hover: {
            textDecoration: "none",
          },
        },

        defaultVariants: {
          variant: "default",
          size: "default",
        },
      },
      size: {
        default: {
          paddingInline: 5,
          paddingBlock: 2,
          has: {
            svg: {
              paddingInline: 3,
            },
          },
        },
        sm: {
          blockSize: 9,
          gap: 1.5,
          rounded: "md",
          paddingInline: 3,
          has: {
            svg: {
              paddingInline: 2.5,
            },
          },
        },
        lg: {
          paddingInline: 10,
          paddingBlock: 3,
          has: {
            svg: {
              paddingInline: 4,
            },
          },
        },
        icon: {
          inlineSize: 5,
        },
        short: {
          paddingInline: 4,
          paddingBlock: 1,
        },
      },
    },
  });

  export type ButtonVariant = RecipeVariant<typeof buttonVariants>["variant"];
  export type ButtonSize = RecipeVariant<typeof buttonVariants>["size"];

  export type ButtonProps = HTMLButtonAttributes &
    HTMLAnchorAttributes & {
      variant?: ButtonVariant;
      size?: ButtonSize;
      class?: string;
    };
</script>

<script lang="ts">
  let {
    class: className,
    variant = "default",
    size = "default",
    disabled,
    children,
    href,
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <a
    {href}
    class={cx(buttonVariants({ variant, size }), className)}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    data-slot="button"
    class={cx(buttonVariants({ variant, size }), className)}
    type="button"
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
