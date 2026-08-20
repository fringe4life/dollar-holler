<script lang="ts" generics="Input extends RemoteFormInput, Output = unknown">
  import type { Snippet } from "svelte";
  import type { RemoteForm, RemoteFormInput } from "$app/server";
  import Alert from "#lib/components/patterns/Alert.svelte";
  import { formIssueKey } from "#lib/components/patterns/form/form-issue.ts";

  interface SubmitSlot {
    pending: boolean;
  }

  interface Props {
    actions?: Snippet;
    children: Snippet;
    footer?: Snippet;
    onSuccess?: () => void;
    remote: RemoteForm<Input, Output>;
    submit: Snippet<[SubmitSlot]>;
  }

  let { remote, children, submit, footer, actions, onSuccess, ...rest }: Props =
    $props();

  const formProps = $derived(
    onSuccess
      ? remote.enhance(async (form) => {
          if (await form.submit()) {
            onSuccess();
          }
        })
      : remote
  );

  const pending = $derived(remote.pending > 0);
  // Form-level issues from invalid("…") strings. Field issues render inline via FormField.
  const issues = $derived(remote.fields.issues() ?? []);
</script>

<form {...formProps} {...rest}>
  {#each issues as issue (formIssueKey(issue))}
    <Alert message={issue.message} />
  {/each}
  <fieldset disabled={pending}>
    {@render children()}
    {#if actions}
      {@render actions()}
    {/if}
    {@render submit({ pending })}
    {#if footer}
      {@render footer()}
    {/if}
  </fieldset>
</form>
