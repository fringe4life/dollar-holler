<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { Snippet } from "svelte";
  import Label from "#lib/components/primitives/label/Label.svelte";
  import FieldErrors from "./FieldErrors.svelte";
  import type { FormIssue } from "./form-issue.ts";

  interface FormFieldSlot {
    errorId: string | undefined;
    invalid: boolean;
  }

  interface FormFieldProps {
    children: Snippet<[FormFieldSlot]>;
    class?: string;
    forId?: string;
    hint?: Snippet;
    issues?: ReadonlyArray<FormIssue> | undefined;
    label?: string;
    labelClass?: string;
  }

  let {
    children,
    label,
    forId,
    class: className,
    labelClass,
    issues,
    hint,
  }: FormFieldProps = $props();

  const errorId = $derived(forId ? `${forId}-error` : undefined);
  const fieldIssuesList = $derived(issues ?? []);
  const invalid = $derived(fieldIssuesList.length > 0);
</script>

<div
  class={cx(
    css({
      marginBlockEnd: 5,
    }),
    className
  )}
>
  {#if label}
    <Label class={labelClass} for={forId}>{label}</Label>
  {/if}
  {@render children({ errorId: invalid ? errorId : undefined, invalid })}
  {#if hint}
    {@render hint()}
  {/if}
  <FieldErrors {errorId} issues={fieldIssuesList} />
</div>
