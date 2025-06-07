<script lang="ts">
  type Props = {
    className?: string
  }

  let { className = '' }: Props = $props()
</script>

<div class={`client-table hidden lg:grid ${className}`}>
  <h3>Status</h3>
  <h3>Client</h3>
  <h3 class="text-right">Received</h3>
  <h3 class="text-right">Balanced</h3>
  <div></div>
  <div></div>
</div>

<style>
  @reference "../../../app.css";

  h3 {
    @apply text-daisyBush text-xl leading-snug font-black;
  }
</style>
