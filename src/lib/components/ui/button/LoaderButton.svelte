<script lang="ts">
  import Loader from "#lib/components/Loader.svelte";
  import { css } from "#styled-system/css/index.js";
  import Button, { type ButtonProps } from "./button.svelte";

  type Props = ButtonProps & {
    pending?: boolean;
  };

  let {
    pending = false,
    disabled,
    children,
    type = "submit",
    ...rest
  }: Props = $props();
</script>

<Button
  aria-busy={pending || undefined}
  disabled={pending || disabled}
  {type}
  {...rest}
>
  <span
    class={css({
      display: "inline-grid",
      placeItems: "center",
    })}
  >
    <span
      class={css({
        gridArea: "1 / 1",
        visibility: pending ? "hidden" : "visible",
      })}
    >
      {@render children?.()}
    </span>
    {#if pending}
      <span aria-hidden="true" class={css({ gridArea: "1 / 1" })}>
        <Loader />
      </span>
    {/if}
  </span>
</Button>
