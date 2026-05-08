<script lang="ts">
  import { css } from "styled-system/css";
  import { center, flex } from "styled-system/patterns";
  import { asset } from "$app/paths";
  import { page } from "$app/state";
</script>

<svelte:head><title>Not Found! | Doller Holla</title></svelte:head>

<div
  class={center({
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundImage: "var(--bg-error)",
    inlineSize: "full",
    minBlockSize: "100dvh",
  })}
  style:--bg-error={`url(${asset('/images/bg-error.svg')})`}
>
  <div>
    <h1
      class={css({
        color: "daisyBush",
        textAlign: "center",
        fontSize: "5xl",
        lineHeight: "none",
        fontWeight: "black",
      })}
    >
      {page.status}
    </h1>
    <p
      class={css({
        color: "daisyBush",
        textAlign: "center",
        fontSize: "lg",
        fontWeight: "bold",
      })}
    >
      Sorry
    </p>
    <p class={css({ color: "daisyBush", textAlign: "center" })}>
      We can't find the page you're looking for.
    </p>
  </div>
</div>
