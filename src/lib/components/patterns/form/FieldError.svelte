<script lang="ts">
  import { css } from "#styled-system/css/index.js";

  interface Props {
    id?: string;
    message: string;
  }

  let { id, message }: Props = $props();
</script>

<p
  class={css({
    color: "scarlet",
    fontSize: "sm",
    marginBlockStart: 1.5,
  })}
  {id}
  role="alert"
>
  {message}
</p>
