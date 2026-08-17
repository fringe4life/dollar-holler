<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { center } from "#styled-system/patterns/index.js";
  import { asset } from "$app/paths";

  interface Props {
    heading: string;
    message: string;
    minBlockSize?: string;
    subheading?: string;
    title?: string;
  }

  let {
    heading,
    message,
    minBlockSize = css({ minBlockSize: "100dvh" }),
    subheading,
    title = "Not Found! | Doller Holla",
  }: Props = $props();

  const layoutClass = center({
    backgroundImage: "var(--bg-error)",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    inlineSize: "full",
  });

  const headingClass = css({
    color: "daisyBush",
    fontSize: "5xl",
    fontWeight: "black",
    lineHeight: "none",
    textAlign: "center",
  });

  const subheadingClass = css({
    color: "daisyBush",
    fontSize: "lg",
    fontWeight: "bold",
    textAlign: "center",
  });

  const messageClass = css({
    color: "daisyBush",
    fontSize: "lg",
    textAlign: "center",
  });
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<div
  class={cx(layoutClass, minBlockSize)}
  style:--bg-error={`url('${asset("images/bg-error.svg")}')`}
>
  <div>
    <h1 class={headingClass}>{heading}</h1>
    {#if subheading}
      <p class={subheadingClass}>{subheading}</p>
    {/if}
    <p class={messageClass}>{message}</p>
  </div>
</div>
