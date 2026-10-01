<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { center, circle } from "#styled-system/patterns/index.js";

  interface Props {
    label?: string;
    size?: "sm" | "md" | "lg";
  }

  let { label = "Loading", size = "md" }: Props = $props();

  // Enumerate pattern calls (literal args). Indexing `minBlock[size]` inside
  // `center({…})` is fold-hostile — Rust transform keeps full pattern runtime.
  // Axis/enum maps fold to class strings; not Cartesian. See #112 / panda docs
  // “Enumerate, don't compute”.
  const wrapBySize = {
    lg: center({ inlineSize: "full", minBlockSize: 40 }),
    md: center({ inlineSize: "full", minBlockSize: 24 }),
    sm: center({ inlineSize: "full", minBlockSize: 10 }),
  } as const;
  const spinBySize = {
    lg: circle({
      animation: "spin",
      borderBottomColor: "transparent",
      borderColor: "foreground",
      borderWidth: 2,
      size: 12,
    }),
    md: circle({
      animation: "spin",
      borderBottomColor: "transparent",
      borderColor: "foreground",
      borderWidth: 2,
      size: 8,
    }),
    sm: circle({
      animation: "spin",
      borderBottomColor: "transparent",
      borderColor: "foreground",
      borderWidth: 2,
      size: 5,
    }),
  } as const;
</script>

<div aria-live="polite" class={wrapBySize[size]} role="status">
  <div aria-hidden="true" class={spinBySize[size]}></div>
  <span
    class={css({
      clip: "rect(0, 0, 0, 0)",
      border: 0,
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      whiteSpace: "nowrap",
      width: "1px",
    })}>{label}</span
  >
</div>
