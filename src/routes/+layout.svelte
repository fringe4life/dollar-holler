<script>
  import '../app.css'
  import { Toaster } from '$lib/components/ui/sonner'
  import ZeroProvider from '$lib/zero/ZeroProvider.svelte'
  let { children, data } = $props()
  const { user } = data
</script>

<Toaster />
<ZeroProvider userID={user?.id || null}>
  {@render children()}
</ZeroProvider>
