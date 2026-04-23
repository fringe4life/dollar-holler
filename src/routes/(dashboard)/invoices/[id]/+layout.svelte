<script lang="ts">
  import { fly } from "svelte/transition";
  import { afterNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import Arrow from "$lib/components/icons/Arrow.svelte";
  import type { Maybe } from "$lib/types";

  let { children } = $props();

  let previousPageLink: Maybe<string> = $state(undefined);

  afterNavigate((navigation) => {
    previousPageLink = navigation?.from?.url?.pathname;
  });

  // Helper function to get the back navigation URL
  function getBackUrl(): string {
    return previousPageLink || resolve("/invoices");
  }

  // Handle escape key navigation
  function handleEscapeKey() {
    goto(getBackUrl());
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") {
      handleEscapeKey();
    }
  }}
/>

<div
  class="bg-whisper pbs-16 block-full inline-full min-block-dvh lg:pbs-12 lg:pbe-32 print:bg-transparent print:py-0"
>
  <main
    transition:fly={{ y: 500, duration: 200 }}
    class="mx-auto max-inline-5xl min-block-dvh"
  >
    <a
      href={getBackUrl()}
      class="text-pastelPurple hover:text-daisyBush fixed inset-s-7 inset-bs-5 transition-colors duration-200 max-inline-full print:hidden"
      ><Arrow /></a
    >
    {@render children()}
  </main>
</div>
