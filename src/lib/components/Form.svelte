<script lang="ts">
  import type { Snippet } from "svelte";
  import { enhance } from "$app/forms";
  import Alert from "$lib/components/Alert.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { Button } from "$lib/components/ui/button";

  interface FormResult {
    data?: unknown;
    type: string;
  }

  interface Props {
    action?: string;
    children: Snippet;
    footer?: Snippet;
    form?: { error?: string } | null;
    method?: "GET" | "POST" | "DIALOG";
    onSuccess?: (result: FormResult) => void;
    submit: Snippet;
  }

  let {
    form,
    children,
    submit,
    footer,
    method = "POST",
    action,
    onSuccess,
    ...rest
  }: Props = $props();

  let isLoading = $state(false);

  function handleEnhance() {
    isLoading = true;
    return async ({
      update,
      result,
    }: {
      update: () => Promise<void>;
      result: FormResult;
    }) => {
      isLoading = false;
      await update();
      onSuccess?.(result);
    };
  }
</script>

<form {method} {action} use:enhance={handleEnhance} {...rest}>
  {#if form?.error}
    <Alert message={form.error} />
  {/if}
  <fieldset disabled={isLoading}>
    {@render children()}
    <Button variant="auth" type="submit" disabled={isLoading}>
      {#if isLoading}
        <Loader />
      {:else}
        {@render submit()}
      {/if}
    </Button>
    {#if footer}
      {@render footer?.()}
    {/if}
  </fieldset>
</form>
