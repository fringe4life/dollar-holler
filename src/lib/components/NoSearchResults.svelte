<script lang="ts">
  import { asset } from "$app/paths";
  import type { Snippet } from "svelte";
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
    style={`--arrow-right: url('${asset("/images/arrow-right-up.svg")}')`}
  >
    <h2 class="font-handwriting text-4xl font-bold text-caribbeanGreen">
      Bummer
    </h2>
    <p class="text-xl font-bold text-caribbeanGreen">
      {message}
    </p>
  </div>

  {@render header()}

  <BlankRow />
  <BlankRow />
  <BlankRow />
</div>
