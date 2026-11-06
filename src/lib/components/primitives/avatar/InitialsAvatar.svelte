<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  /** `sm` is the select-option size; `md` is for page headers. */
  type InitialsAvatarSize = "sm" | "md";

  interface InitialsAvatarProps {
    name: string;
    size?: InitialsAvatarSize;
  }

  let { name, size = "sm" }: InitialsAvatarProps = $props();

  /**
   * Sticker treatment, not a flat disc: the shared `squircle` corner family, a
   * top-left sheen, a lit rim and a shadowed underside so the initials read as
   * printed ink on a bead rather than text on a colour fill. Every layer is a
   * gradient or a shadow, so it holds down to the 24px select option.
   *
   * Workaround: top-level `css()` maps instead of `cva` so hashed class names do
   * not force the full recipe runtime into the client bundle.
   *
   * @remarks
   * Still required on `@pandacss/vite@2.5.0` / `@pandacss/dev@2.5.0` with
   * `hash: true`. Drop when Panda folds hashed local `cva`/`sva` to string
   * lookups; re-verify no client chunk with `compoundVariants` / `__cva__`
   * after clean build.
   *
   * @see https://github.com/chakra-ui/panda/issues/3853 — related transform diagnostics
   * @see https://github.com/fringe4life/van-life/issues/471 — established pattern
   * @see https://github.com/fringe4life/dollar-holler/issues/109 — tracking
   */
  const avatarBase = css({
    alignItems: "center",
    backgroundImage:
      "radial-gradient(circle at 32% 22%, rgb(255 255 255 / 0.45), rgb(255 255 255 / 0) 62%), linear-gradient(155deg, rgb(255 255 255 / 0) 42%, rgb(0 0 0 / 0.16))",
    borderRadius: "full",
    color: "avatarForeground",
    cornerShape: CORNER_SHAPE,
    display: "inline-flex",
    flexShrink: 0,
    justifyContent: "center",
    lineHeight: "none",
    textShadow: "0 1px 1px rgb(0 0 0 / 0.28)",
    textTransform: "uppercase",
  });

  const avatarBySize = {
    sm: css({
      blockSize: 6,
      boxShadow:
        "inset 0 0 0 1px rgb(255 255 255 / 0.3), inset 0 -1px 1px rgb(0 0 0 / 0.14), 0 1px 2px rgb(0 0 0 / 0.16)",
      fontSize: "xs",
      fontWeight: "bold",
      inlineSize: 6,
    }),
    md: css({
      blockSize: 10,
      // Deeper rim + a longer shadow, so the extra 16px reads as thickness.
      boxShadow:
        "inset 0 0 0 1.5px rgb(255 255 255 / 0.32), inset 0 -3px 6px rgb(0 0 0 / 0.16), 0 1px 2px rgb(0 0 0 / 0.18), 0 5px 12px -5px rgb(0 0 0 / 0.45)",
      fontSize: "md",
      fontWeight: "black",
      inlineSize: 10,
      letterSpacing: "tight",
    }),
  } as const satisfies Record<InitialsAvatarSize, string>;

  function avatarClass({ size: avatarSize }: { size: InitialsAvatarSize }) {
    return cx(avatarBase, avatarBySize[avatarSize]);
  }

  // Literal css() calls so Panda can statically extract each semantic color class.
  const backgroundClasses = [
    css({ backgroundColor: "avatarPrimary" }),
    css({ backgroundColor: "avatarSecondary" }),
    css({ backgroundColor: "avatarTertiary" }),
    css({ backgroundColor: "avatarAccent" }),
  ];

  const HASH_PRIME = 31;

  const hashName = (input: string): number => {
    let hash = 0;
    for (const char of input) {
      hash = Math.trunc(hash * HASH_PRIME + (char.codePointAt(0) ?? 0));
    }
    return Math.abs(hash);
  };

  const MAX_INITIALS = 2;

  const initials = $derived(
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, MAX_INITIALS)
      .map((word) => word[0])
      .join("") || "?"
  );

  const backgroundClass = $derived(
    backgroundClasses[hashName(name) % backgroundClasses.length]
  );
</script>

<span aria-hidden="true" class={cx(avatarClass({ size }), backgroundClass)}
  >{initials}</span
>
