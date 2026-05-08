<script lang="ts">
  import { css } from "styled-system/css";
  import { center, flex } from "styled-system/patterns";
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
  class={center({ backgroundImage: "var(--bg-error)", backgroundPosition: "center", bgRepeat: "no-repeat", minBlockSize: "calc(100dvh - var(--spacing-16))" })}
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
