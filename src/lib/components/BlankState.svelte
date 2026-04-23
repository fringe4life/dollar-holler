<script lang="ts">
  import type { Snippet } from "svelte";
  import { asset } from "$app/paths";
  import BlankRow from "$lib/components/BlankRow.svelte";

  interface Props {
    header: Snippet;
    message: string;
  }

  let { message, header }: Props = $props();

  const arrowLeft = `url(${JSON.stringify(asset("/images/arrow-left-up.svg"))})`;
  const arrowRight = `url(${JSON.stringify(asset("/images/arrow-right-up.svg"))})`;
</script>

<div>
  <div class="-mbs-14">
    <h2
      style:--arrow-left={arrowLeft}
      style:--arrow-right={arrowRight}
      class="blank-state-header font-handwriting text-caribbeanGreen mbe-10 bg-(image:--arrow-left) bg-left bg-no-repeat ps-28 pbs-14 text-2xl font-bold capitalize md:bg-(image:--arrow-right) md:bg-right md:ps-10 md:pe-28 md:text-right md:text-4xl"
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
