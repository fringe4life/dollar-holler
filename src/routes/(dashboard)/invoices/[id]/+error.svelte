<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import { asset } from "$app/paths";
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>Not Found! | Doller Holla</title>

  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<div
  class={cx(flex({ justify: "center", align: "center" }), css({ bgPosition: "center", bgRepeat: "no-repeat", inlineSize: "full", minBlockSize: "calc(100dvh-3rem-1.75rem)" }))}
  style:background-image="url('{asset('/images/bg-error.svg')}')"
>
  <div>
    <h1
      class={css({ color: "daisyBush", fontSize: "5xl", lineHeight: "none", fontWeight: "black" })}
    >
      Not Found!
    </h1>
    <p class={css({ color: "daisyBush", textAlign: "center", fontSize: "lg" })}>
      {page.error?.message}
    </p>
  </div>
</div>
