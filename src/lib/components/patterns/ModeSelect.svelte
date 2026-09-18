<script lang="ts">
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import SunMoonIcon from "@lucide/svelte/icons/sun-moon";
  import { css, cx } from "#styled-system/css/index.js";
  import { square } from "#styled-system/patterns/index.js";
  import { page } from "$app/state";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import Select from "#lib/components/primitives/select/Select.svelte";
  import {
    resolvedThemeChoice,
    selectThemeChoice,
  } from "#lib/theme/choice.svelte.ts";
  import { THEME_CHOICES, type ThemeChoice } from "#lib/theme/schema.ts";

  const labels = {
    dark: "Dark",
    light: "Light",
    system: "System",
  } as const satisfies Record<ThemeChoice, Capitalize<ThemeChoice>>;

  const icons = {
    dark: MoonIcon,
    light: SunIcon,
    system: SunMoonIcon,
  } as const satisfies Record<ThemeChoice, typeof SunIcon>;

  // Lucide icons are stroke-based; undo the global `svg { fill }` rule.
  const themeIconClass = cx(
    square({ size: 4 }),
    css({ color: "textMuted", fill: "none", flexShrink: 0 })
  );

  const selected = $derived(resolvedThemeChoice(page.data.theme ?? "system"));

  const setColorMode = (mode: ThemeChoice) => {
    selectThemeChoice(mode);
  };
</script>

<Select
  aria-label="Color mode"
  name="theme"
  onchange={(e) => {
    const { value } = e.currentTarget;
    if (value === "dark" || value === "light" || value === "system") {
      setColorMode(value);
    }
  }}
  value={selected}
>
  {#each THEME_CHOICES as value (value)}
    {@const ThemeIcon = icons[value]}
    <option
      onclick={() => {
        if (supportsBaseSelect) {
          setColorMode(value);
        }
      }}
      {value}
    >
      {#if supportsBaseSelect}
        <ThemeIcon aria-hidden="true" class={themeIconClass} />
      {/if}
      {labels[value]}
    </option>
  {/each}
</Select>
