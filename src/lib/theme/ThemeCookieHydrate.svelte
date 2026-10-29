<script lang="ts">
  import { hydrateThemeChoice } from "#lib/theme/choice.svelte.ts";
  import { applyDocumentTheme, readThemeCookie } from "#lib/theme/theme.ts";

  $effect(() => {
    const stored = readThemeCookie() ?? "system";
    hydrateThemeChoice(stored);
    applyDocumentTheme(stored);
  });
</script>
