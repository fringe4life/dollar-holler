<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";

  /**
   * Three buttons, not a native select. A colour-mode choice is a radio group
   * the user compares at a glance; a popup hides two of the three options and
   * cannot show a hover state on them.
   */
  const controlClass = css({
    alignItems: "center",
    borderColor: "current/18",
    borderRadius: "xl",
    borderStyle: "solid",
    borderWidth: 1,
    display: "inline-flex",
    gap: 0.5,
    padding: 0.5,
  });

  /**
   * Workaround: top-level `css()` maps instead of `cva` so hashed class names do
   * not force the full recipe runtime into the client bundle.
   *
   * @remarks
   * Still required on `@pandacss/vite@2.5.0` / `@pandacss/dev@2.5.0` with
   * `hash: true`. Drop when Panda folds hashed local `cva`/`sva` to string
   * lookups; re-verify no client chunk with `compoundVariants` / `__cva__`
   * after clean build.
   *
   * @see https://github.com/chakra-ui/panda/issues/3853 — related transform diagnostics
   * @see https://github.com/fringe4life/van-life/issues/471 — established pattern
   * @see https://github.com/fringe4life/dollar-holler/issues/109 — tracking
   */
  const optionBase = css({
    alignItems: "center",
    borderRadius: "md",
    blockSize: 8,
    color: "inherit",
    cursor: "pointer",
    display: "grid",
    inlineSize: 8,
    justifyContent: "center",
    opacity: 0.62,
    placeItems: "center",
    transitionDuration: "normal",
    transitionProperty: "background-color, opacity, scale",
    transitionTimingFunction: "anticipate",
    _active: { scale: 0.9 },
    _focusVisible: {
      outlineColor: "ring",
      outlineOffset: 2,
      outlineStyle: "solid",
      outlineWidth: 2,
    },
    _hover: {
      backgroundColor: "current/12",
      opacity: 1,
    },
    _motionReduce: { transitionDuration: "0.01ms" },
  });

  const optionSelected = css({
    backgroundColor: "current/16",
    opacity: 1,
  });

  function optionClass({ selected = false }: { selected?: boolean } = {}) {
    return selected ? cx(optionBase, optionSelected) : optionBase;
  }
</script>

<script lang="ts">
  import { page } from "$app/state";
  import type { IconComponent } from "#lib/components/primitives/icons/types.ts";
  import Monitor from "#lib/components/primitives/icons/Monitor.svelte";
  import Moon from "#lib/components/primitives/icons/Moon.svelte";
  import Sun from "#lib/components/primitives/icons/Sun.svelte";
  import {
    resolvedThemeChoice,
    selectThemeChoice,
  } from "#lib/theme/choice.svelte.ts";
  import { parseThemeChoice, type ThemeChoice } from "#lib/theme/schema.ts";

  const options: readonly {
    glyph: IconComponent;
    label: string;
    value: ThemeChoice;
  }[] = [
    { glyph: Sun, label: "Light", value: "light" },
    { glyph: Moon, label: "Dark", value: "dark" },
    { glyph: Monitor, label: "System", value: "system" },
  ];

  const selected = $derived(resolvedThemeChoice(page.data.theme ?? "system"));

  const setColorMode = (raw: string) => {
    const mode = parseThemeChoice(raw);
    if (mode) {
      selectThemeChoice(mode);
    }
  };
</script>

<div aria-label="Color mode" class={controlClass} role="group">
  {#each options as { glyph: Glyph, label, value } (value)}
    <button
      aria-label={label}
      aria-pressed={selected === value}
      class={optionClass({ selected: selected === value })}
      onclick={() => setColorMode(value)}
      type="button"
    >
      <Glyph size={16} />
    </button>
  {/each}
</div>
