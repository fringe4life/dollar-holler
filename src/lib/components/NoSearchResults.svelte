<script lang="ts">
  import type { Snippet } from "svelte";
  import { asset } from "$app/paths";
  import BlankRow from "./BlankRow.svelte";

  let {
    message = "We didn't find anything that you were looking for.",
    header,
  }: {
    message?: string;
    header: Snippet;
  } = $props();
</script>

<div class="mbs-20 lg:-mbs-14">
  <div
    class="ms-2 mbe-10 bg-(--arrow-right) bg-no-repeat ps-28 pbs-14"
    style:--arrow-right="url(${asset('/images/arrow-right-up.svg')})"
  >
    <h2 class="font-handwriting text-caribbeanGreen text-4xl font-bold">
      Bummer
    </h2>
    <p class="text-caribbeanGreen text-xl font-bold">{message}</p>
  </div>

  {@render header()}

  <BlankRow />
  <BlankRow />
  <BlankRow />
</div>
