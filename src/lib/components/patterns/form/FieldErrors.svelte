<script lang="ts">
  import FieldError from "./FieldError.svelte";
  import { formIssueKey, type FormIssue } from "./form-issue.ts";

  interface Props {
    errorId?: string;
    issues?: ReadonlyArray<FormIssue> | undefined;
  }

  let { errorId, issues }: Props = $props();
</script>

{#each issues ?? [] as issue, index (formIssueKey(issue))}
  <FieldError id={index === 0 ? errorId : undefined} message={issue.message} />
{/each}
