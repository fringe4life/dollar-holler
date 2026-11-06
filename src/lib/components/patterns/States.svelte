<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import Flag from "#lib/components/primitives/icons/Flag.svelte";
  import { stateFlag, states } from "#lib/utils/states.ts";
  import Select from "#lib/components/primitives/select/Select.svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  let {
    value = $bindable(),
    name = "state",
    "aria-describedby": ariaDescribedby,
    "aria-invalid": ariaInvalid,
  }: HTMLSelectAttributes = $props();

  const flagClass = css({
    borderRadius: "xs",
    flexShrink: 0,
  });

  // Fallback for states without a flag on flagcdn (District of Columbia).
  const fallbackFlagClass = css({
    color: "textMuted",
    flexShrink: 0,
  });
</script>

<Select
  id="state"
  {name}
  aria-describedby={ariaDescribedby ?? undefined}
  aria-invalid={ariaInvalid}
  wrapperClass={css({ inlineSize: "full" })}
  bind:value
>
  {#each states as { value: stateValue, name } (name)}
    {@const flag = stateFlag(stateValue)}
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
          <Flag aria-hidden="true" class={fallbackFlagClass} />
        {/if}
      {/if}
      {name}
    </option>
  {/each}
</Select>
