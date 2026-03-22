<script lang="ts">
  import { enhance } from "$app/forms";
  import Alert from "$lib/components/Alert.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { Snippet } from "svelte";

  type FormResult = { type: string; data?: unknown };

  type Props = {
    form?: { error?: string } | null;
    children: Snippet;
    submit: Snippet;
    footer?: Snippet;
    method?: "GET" | "POST" | "DIALOG";
    action?: string;
    onSuccess?: (result: FormResult) => void;
  };

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
