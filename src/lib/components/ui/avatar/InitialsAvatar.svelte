<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";

  interface InitialsAvatarProps {
    name: string;
  }

  let { name }: InitialsAvatarProps = $props();

  const avatarClass = css({
    alignItems: "center",
    blockSize: 6,
    borderRadius: "full",
    color: "white",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "xs",
    fontWeight: "bold",
    inlineSize: 6,
    justifyContent: "center",
    lineHeight: "none",
    textTransform: "uppercase",
  });

  // Literal css() calls so Panda can statically extract each color class.
  const backgroundClasses = [
    css({ backgroundColor: "lavenderIndigo" }),
    css({ backgroundColor: "daisyBush" }),
    css({ backgroundColor: "blueGem" }),
    css({ backgroundColor: "purple" }),
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

<span aria-hidden="true" class={cx(avatarClass, backgroundClass)}
  >{initials}</span
>
