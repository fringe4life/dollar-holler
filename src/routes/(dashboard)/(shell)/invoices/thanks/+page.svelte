<script lang="ts">
  import { css } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import { asset } from "$app/paths";
</script>

<svelte:head> <title>Thank You! | Doller Holla</title> </svelte:head>

<div
  class={flex({ justify: "center", align: "center", backgroundPosition: "center", backgroundRepeat: "no-repeat", inlineSize: "full", backgroundImage: "var(--bg-thankYou)" })}
  style:--bg-thankYou={`url(${asset('/images/bg-thankYou.svg')})`}
>
  <div>
    <h1
      class={css({ color: "daisyBush", fontSize: "5xl", lineHeight: "none", fontWeight: "black" })}
    >
      Thank You!
    </h1>
    <p class={css({ color: "daisyBush", fontSize: "lg" })}>
      Your payment has been received!
    </p>
  </div>
</div>
