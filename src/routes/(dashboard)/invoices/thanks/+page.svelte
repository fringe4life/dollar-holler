<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { center } from "#styled-system/patterns/index.js";
  import { asset } from "$app/paths";
</script>

<svelte:head>
  <title>Thank You! | Doller Holla</title>
  <meta
    content="Payment received. Thank you for using Dollar Holler invoices."
    name="description"
  />
</svelte:head>

<div
  class={center({
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    inlineSize: "full",
    backgroundImage: "var(--bg-thankYou)",
  })}
  style:--bg-thankYou={`url(${asset("images/bg-thankYou.svg")})`}
>
  <div>
    <h1
      class={css({
        color: "daisyBush",
        fontSize: "5xl",
        lineHeight: "none",
        fontWeight: "black",
      })}
    >
      Thank You!
    </h1>
    <p class={css({ color: "daisyBush", fontSize: "lg" })}>
      Your payment has been received!
    </p>
  </div>
</div>
