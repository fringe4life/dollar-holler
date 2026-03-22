<script lang="ts">
  import { asset } from "$app/paths";
  import BlankRow from "$lib/components/BlankRow.svelte";
  import type { Snippet } from "svelte";

  interface Props {
    message: string;
    header: Snippet;
  }

  let { message, header }: Props = $props();
</script>

<div>
  <div class="-mbs-14">
    <h2
      class="blank-state-header mbe-10 bg-(--arrow-left) bg-left bg-no-repeat ps-28 pbs-14 font-handwriting text-2xl font-bold text-caribbeanGreen capitalize md:bg-(--arrow-right) md:bg-right md:ps-10 md:pe-28 md:text-right md:text-4xl"
      style="--arrow-left: url('{asset(
        '/images/arrow-left-up.svg'
      )}'); --arrow-right: url('{asset('/images/arrow-right-up.svg')}')"
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
</div>
