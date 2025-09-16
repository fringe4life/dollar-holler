<script lang="ts">
  import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner'
  import { mode } from 'mode-watcher'

  type Props = {
    className?: 'error' | 'warning' | 'info' | 'success'
  } & SonnerProps

  let { className = 'info', ...restProps }: Props = $props()
</script>

<Sonner
  theme={mode.current}
  class={{
    'toaster group': true,
    'bg-prim text-daisyBush': className === 'info',
    'bg-scarlet text-goldenFizz': className === 'error',
    'bg-robinEggBlue text-daisyBush': className === 'success',
    'bg-goldenFizz text-scarlet': className === 'warning',
  }}
  style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border);"
  {...restProps}
/>
<!-- style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border);" -->

<!-- style={`
	--normal-bg: ${className === 'error' ? 'bg-scarlet' : className === 'info' ? 'bg-prim' : className === 'success' ? 'bg-robinEggBlue' : 'bg-goldenFizz'}
	--normal-text: ${className === 'error' ? 'text-goldenFizz' : className === 'info' ? 'text-daisyBush' : className === 'success' ? 'text-daisyBush' : 'text-scarlet'}
	--normal-border: ${className === 'error' ? 'text-goldenFizz' : className === 'info' ? 'text-daisyBush' : className === 'success' ? 'text-daisyBush' : 'text-scarlet'}
	`} -->
