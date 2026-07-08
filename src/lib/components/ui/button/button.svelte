<script lang="ts" module>
  import { cva, cx, type RecipeVariant } from "styled-system/css";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";

  export const buttonVariants = cva({
    base: {
      alignItems: "center",
      cursor: "pointer",
      display: "inline-flex",
      fontFamily: "sansserif",
      gap: 2,
      justifyContent: "center",
      rounded: "lg",
      whiteSpace: "nowrap",
    },
    variants: {
      size: {
        default: {
          has: {
            svg: {
              paddingInline: 3,
            },
          },
          paddingBlock: 2,
          paddingInline: 5,
        },
        icon: {
          inlineSize: 5,
        },
        lg: {
          has: {
            svg: {
              paddingInline: 4,
            },
          },
          paddingBlock: 3,
          paddingInline: 10,
        },
        short: {
          paddingBlock: 1,
          paddingInline: 4,
        },
        sm: {
          blockSize: 9,
          gap: 1.5,
          has: {
            svg: {
              paddingInline: 2.5,
            },
          },
          paddingInline: 3,
          rounded: "md",
        },
      },
      variant: {
        auth: {
          _after: {
            content: "''",
            inset: 0,
            opacity: "0",
            position: "absolute",
            rounded: "inherit",
            shadow: "lg",
            transitionDuration: "normal",
            transitionProperty: "opacity",
          },
          _hover: {
            _after: {
              opacity: "1",
            },
            translate: "0 -4px",
          },
          _supportsLinear: {
            transitionTimingFunction: "glide",
          },
          backgroundColor: "robinEggBlue",
          color: "daisyBush",
          fontSize: "xl",
          fontWeight: "bold",
          inlineSize: "full",
          minBlockSize: 14,
          paddingBlock: 3,
          paddingInline: 4,
          position: "relative",
          rounded: "lg",
          transitionDuration: "normal",
          transitionProperty: "translate",
        },
        default: {
          _after: {
            content: "''",
            inset: 0,
            opacity: "0",
            position: "absolute",
            rounded: "inherit",
            shadow: "lg",
            transitionDuration: "normal",
            transitionProperty: "opacity",
          },
          _hover: {
            _after: {
              opacity: "1",
            },
            translate: "-2px -2px",
          },
          backgroundColor: "lavenderIndigo",
          color: "white",
          fontWeight: "black",
          position: "relative",
          transitionDuration: "normal",
          transitionProperty: "translate",
          transitionTimingFunction: "anticipate",
        },

        defaultVariants: {
          size: "default",
          variant: "default",
        },
        destructive: {
          backgroundColor: { _hover: "scarlet/90", base: "scarlet" },
          color: "goldenFizz",
          shadow: "xs",
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        ghost: {
          color: { _hover: "blueGem", base: "pastelPurple" },
          shadow: "xs",
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        link: {
          _hover: {
            textDecoration: "none",
          },
          color: "primary",
          textDecoration: "underline",
          textUnderlineOffset: 4,
        },
        outline: {
          _disabled: {
            _hover: {
              backgroundColor: "transparent",
              borderColor: "red.500",
              color: "red.500",
            },
            backgroundColor: "transparent",
            borderColor: "red.500",
            color: "red.500",
            cursor: "not-allowed",
          },
          backgroundColor: { _hover: "daisyBush/90", base: "transparent" },
          borderColor: "daisyBush",
          borderStyle: "solid",
          borderWidth: 2,
          color: { _hover: "white", base: "daisyBush" },
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        secondary: {
          _hover: {
            backgroundColor: "gallery",
            color: "blueGem",
          },
          backgroundColor: "gallery/80",
          color: "blueGem/90",
          fontWeight: "bold",
          shadow: "colored",
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        textOnly: {
          _hover: {
            textDecoration: "underline",
          },
          backgroundColor: "transparent",
          color: "lavenderIndigo",
          textDecoration: "none",
        },
        textOnlyDestructive: {
          _hover: {
            textDecoration: "none",
          },
          backgroundColor: "transparent",
          color: "scarlet",
          paddingInline: 0,
          textDecoration: "underline",
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
    class={cx(buttonVariants({ variant, size }), className)}
    {href}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class={cx(buttonVariants({ variant, size }), className)}
    data-slot="button"
    {disabled}
    type="button"
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
