<script lang="ts">
  import { grid } from "styled-system/patterns";
  import { features } from "$features/landing-page/constants/features.js";
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
