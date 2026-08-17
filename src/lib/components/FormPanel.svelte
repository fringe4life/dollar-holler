<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { visuallyHidden } from "#styled-system/patterns/index.js";
  import type { Attachment } from "svelte/attachments";
  import type { Snippet } from "svelte";
  import Modal from "#lib/components/Modal.svelte";

  interface FormPanelProps {
    attach: Attachment<HTMLDialogElement>;
    children?: Snippet;
    descriptionText: string;
    onClose: () => void;
    titleText: string;
  }

  let {
    attach,
    children,
    descriptionText,
    onClose,
    titleText,
  }: FormPanelProps = $props();

  const panelTitle = css({
    color: "daisyBush",
    fontFamily: "sansserif",
    fontSize: "3xl",
    fontWeight: "bold",
    marginBlockEnd: 7,
    marginBlockStart: { base: 9, lg: 0 },
  });
</script>

<Modal {onClose} variant="panel" {@attach attach}>
  {#snippet title()}
    <h2 class={panelTitle}>{titleText}</h2>
  {/snippet}

  {#snippet description()}
    <h2 class={visuallyHidden()}>{descriptionText}</h2>
  {/snippet}

  {@render children?.()}
</Modal>
