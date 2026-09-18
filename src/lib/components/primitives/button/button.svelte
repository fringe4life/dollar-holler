<script lang="ts" module>
  import { cva, cx, type RecipeVariant } from "#styled-system/css/index.js";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";

  export const buttonVariants = cva({
    base: {
      _focusVisible: {
        outlineColor: "ring",
        outlineOffset: "2px",
        outlineStyle: "solid",
        outlineWidth: "2px",
      },
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
          backgroundColor: "authButton",
          color: "authButtonForeground",
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
          backgroundColor: "primary",
          color: "primaryForeground",
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
          backgroundColor: { _hover: "destructive/90", base: "destructive" },
          color: "destructiveForeground",
          shadow: "xs",
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        ghost: {
          color: { _hover: "foreground", base: "mutedAction" },
          shadow: "xs",
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        link: {
          _hover: {
            textDecoration: "none",
          },
          color: "link",
          textDecoration: "underline",
          textUnderlineOffset: 4,
        },
        outline: {
          _disabled: {
            _hover: {
              backgroundColor: "transparent",
              borderColor: "destructive",
              color: "destructive",
            },
            backgroundColor: "transparent",
            borderColor: "destructive",
            color: "destructive",
            cursor: "not-allowed",
          },
          backgroundColor: { _hover: "inverse/90", base: "transparent" },
          borderColor: "outline",
          borderStyle: "solid",
          borderWidth: 2,
          color: { _hover: "foregroundInverse", base: "outline" },
          transitionDuration: "normal",
          transitionProperty: "colors",
        },
        secondary: {
          _hover: {
            backgroundColor: "secondary",
            color: "secondaryForeground",
          },
          backgroundColor: "secondary/80",
          color: "secondaryForeground/90",
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
          color: "link",
          textDecoration: "none",
        },
        textOnlyDestructive: {
          _hover: {
            textDecoration: "none",
          },
          backgroundColor: "transparent",
          color: "destructive",
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
