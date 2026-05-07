<script lang="ts">
  import { css } from "styled-system/css";
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
<!-- "flex items-center justify-center bg-center bg-no-repeat inline-full min-block-[calc(100dvh-3rem-1.75rem)]" -->
<div
  class={flex({ justify: "center", align: "center", backgroundImage: "var(--bg-error)", backgroundPosition: "center", bgRepeat: "no-repeat", inlineSize: "full", minBlockSize: "calc(100dvh-3rem-1.75rem)" })}
  style:--bg-error={`url(${asset('/images/bg-error.svg')})`}
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
