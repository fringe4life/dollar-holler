<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { center, circle } from "#styled-system/patterns/index.js";

  interface Props {
    label?: string;
    size?: "sm" | "md" | "lg";
  }

  let { label = "Loading", size = "md" }: Props = $props();

  const spinnerSize = { lg: 12, md: 8, sm: 5 } as const;
  const minBlock = { lg: 40, md: 24, sm: 10 } as const;
</script>

<div
  aria-live="polite"
  class={center({
    inlineSize: "full",
    minBlockSize: minBlock[size],
  })}
  role="status"
>
  <div
    aria-hidden="true"
    class={circle({
      animation: "spin",
      borderBottomColor: "transparent",
      borderColor: "daisyBush",
      borderWidth: 2,
      size: spinnerSize[size],
    })}
  ></div>
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
