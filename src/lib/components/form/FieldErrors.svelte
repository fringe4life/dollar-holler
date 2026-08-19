<script lang="ts">
  import FieldError from "./FieldError.svelte";

  interface Props {
    errorId?: string;
    issues?: ReadonlyArray<{ message: string }> | undefined;
  }

  let { errorId, issues }: Props = $props();
</script>

{#each issues ?? [] as issue, index (index)}
  <FieldError id={index === 0 ? errorId : undefined} message={issue.message} />
{/each}
