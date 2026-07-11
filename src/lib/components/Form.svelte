<script lang="ts" generics="Input extends RemoteFormInput, Output = unknown">
  import type { Snippet } from "svelte";
  import type { RemoteForm, RemoteFormInput } from "@sveltejs/kit";
  import Alert from "$lib/components/Alert.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  interface Props {
    children: Snippet;
    footer?: Snippet;
    onSuccess?: () => void;
    remote: RemoteForm<Input, Output>;
    submit: Snippet;
  }

  let { remote, children, submit, footer, onSuccess, ...rest }: Props =
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

  const isLoading = $derived(remote.pending > 0);
  const issues = $derived(remote.fields.allIssues() ?? []);
</script>

<form {...formProps} {...rest}>
  {#each issues as issue, index (index)}
    <Alert message={issue.message} />
  {/each}
  <fieldset disabled={isLoading}>
    {@render children()}
    <Button disabled={isLoading} type="submit" variant="auth">
      {#if isLoading}
        <Loader />
      {:else}
        {@render submit()}
      {/if}
    </Button>
    {#if footer}
      {@render footer()}
    {/if}
  </fieldset>
</form>
