<script lang="ts">
  import type { Snippet } from 'svelte';
  import { asset } from '$app/paths';
  import BlankRow from '$lib/components/BlankRow.svelte';

  interface Props {
    message: string;
    header: Snippet;
  }

  let { message, header }: Props = $props();
</script>

<div>
  <div class="-mt-14">
    <h2
      class="blank-state-header font-handwriting text-caribbeanGreen mb-10 bg-left bg-no-repeat pt-14 pl-28 text-2xl font-bold capitalize md:bg-right md:pr-28 md:pl-10 md:text-right md:text-4xl"
      style="--arrow-left: url('{asset('/images/arrow-left-up.svg')}'); --arrow-right: url('{asset(
        '/images/arrow-right-up.svg'
      )}')"
    >
      {message}
    </h2>
  </div>

  <!-- row header -->
  {@render header()}

  <!-- blank rows -->
  <BlankRow />
  <BlankRow />
  <BlankRow />
  <BlankRow />
</div>

<style>
  .blank-state-header {
    background-image: var(--arrow-left);
  }

  @media (min-width: 768px) {
    .blank-state-header {
      background-image: var(--arrow-right);
    }
  }
</style>
