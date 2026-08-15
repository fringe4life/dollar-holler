<script lang="ts">
  import FlagIcon from "@lucide/svelte/icons/flag";
  import { css } from "styled-system/css";
  import { supportsBaseSelect } from "#lib/client/supports";
  import type { Maybe } from "#lib/types";
  import { stateFlag, states } from "#lib/utils/states";
  import Select from "./ui/select/Select.svelte";

  interface Props {
    value: Maybe<string>;
  }

  let { value = $bindable() }: Props = $props();

  const flagClass = css({
    borderRadius: "xs",
    flexShrink: 0,
  });

  // Fallback for states without a flag on flagcdn (District of Columbia).
  const fallbackFlagClass = css({
    blockSize: "18px",
    color: "monsoon",
    fill: "none",
    flexShrink: 0,
    inlineSize: 6,
  });
</script>

<Select id="state" name="state" bind:value>
  {#each states as { value: stateValue, name } (name)}
    {const flag = stateFlag(stateValue)}
    <option
      onclick={() => {
        value = stateValue;
      }}
      value={stateValue}
    >
      {#if supportsBaseSelect}
        {#if flag}
          <img
            alt=""
            class={flagClass}
            height={18}
            loading="lazy"
            src={flag.src}
            srcset={flag.srcset}
            width={24}
          />
        {:else}
          <FlagIcon aria-hidden="true" class={fallbackFlagClass} />
        {/if}
      {/if}
      {name}
    </option>
  {/each}
</Select>
