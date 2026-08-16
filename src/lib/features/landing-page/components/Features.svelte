<script lang="ts">
  import { grid } from "#styled-system/patterns/index.js";
  import { features } from "#features/landing-page/constants/features.ts";
  import FeatureItem from "./FeatureItem.svelte";
</script>

<div
  class={grid({
    gap: 6,
    columns: { base: 1, sm: 2, lg: 4 },
  })}
>
  {#each features as feature (feature.title)}
    <FeatureItem {feature} />
  {/each}
</div>
