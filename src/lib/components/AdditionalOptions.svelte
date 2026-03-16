<script lang="ts">
  import { Toggle } from "$lib/attachments/Toggle.svelte";
  import { type Snippet } from "svelte";
  import { type Option } from "./additionaloptions/AdditionalOptionsItem.svelte";
  type Props = {
    options: Option[];
    classes?: string;
    content: Snippet<[Toggle, Option[]]>;
  };

  let { options, classes = "", content }: Props = $props();

  const additionalMenu = new Toggle();
</script>

<div
  class={{
    "relative hidden place-self-center lg:grid": true,
    [classes]: classes,
  }}
>
  {@render content(additionalMenu, options)}
</div>
