<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { Snippet } from "svelte";
  import Label from "$lib/components/ui/label/Label.svelte";

  interface FormFieldProps {
    children: Snippet;
    class?: string;
    forId?: string;
    label?: string;
    labelClass?: string;
  }

  let {
    children,
    label,
    forId,
    class: className,
    labelClass,
  }: FormFieldProps = $props();
</script>

<div
  class={cx(css({
    marginBlockEnd: 5,
  }), className)}
>
  {#if label}
    <Label for={forId} class={labelClass}>{label}</Label>
  {/if}
  {@render children()}
</div>
